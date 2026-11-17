import type {
  DevicePermission,
  DevicePosition,
  LocationAdapter,
} from "./device-location";

/** Subconjunto de la API de geolocalización del navegador que se usa. */
export interface BrowserGeolocation {
  getCurrentPosition(
    success: (position: {
      coords: { latitude: number; longitude: number; accuracy: number | null };
      timestamp: number;
    }) => void,
    error: (error: { code: number }) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    },
  ): void;
}

export interface BrowserPermissions {
  query(descriptor: { name: "geolocation" }): Promise<{ state: string }>;
}

const PERMISSION_DENIED = 1;

/**
 * Adaptador web para readDeviceLocation. La posición se resuelve en el
 * navegador y se usa solo en memoria: no hay geocodificación externa ni
 * envío de coordenadas. El permiso lo pide el propio navegador.
 */
export function createBrowserLocationAdapter(
  geolocation: BrowserGeolocation | undefined,
  permissions?: BrowserPermissions,
): LocationAdapter {
  let cached: DevicePosition | null = null;
  let deniedByUser = false;

  const read = () =>
    new Promise<DevicePosition>((resolve, reject) => {
      if (!geolocation) {
        reject(new Error("sin geolocalización"));
        return;
      }
      geolocation.getCurrentPosition(
        (position) =>
          resolve({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            },
            timestamp: position.timestamp,
          }),
        (error) => {
          if (error.code === PERMISSION_DENIED) deniedByUser = true;
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
      );
    });

  const getPermission = async (): Promise<DevicePermission> => {
    if (!geolocation || deniedByUser)
      return { status: "denied", canAskAgain: false };
    try {
      const state = (await permissions?.query({ name: "geolocation" }))?.state;
      if (state === "granted") return { status: "granted", canAskAgain: true };
      // El navegador no vuelve a preguntar tras un rechazo: se cambia en sus ajustes.
      if (state === "denied") return { status: "denied", canAskAgain: false };
    } catch {
      /* Algunos navegadores no exponen la consulta de permisos. */
    }
    return { status: "undetermined", canAskAgain: true };
  };

  return {
    getPermission,
    requestPermission: async () => {
      try {
        cached = await read();
        return { status: "granted", canAskAgain: true };
      } catch {
        return deniedByUser
          ? { status: "denied", canAskAgain: false }
          : { status: "granted", canAskAgain: true };
      }
    },
    servicesEnabled: async () => Boolean(geolocation),
    getPosition: async () => {
      const position = cached ?? (await read());
      cached = null;
      return position;
    },
    reverseGeocode: async () => [],
  };
}
