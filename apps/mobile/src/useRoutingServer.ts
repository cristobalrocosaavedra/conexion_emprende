import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  checkRoutingServer,
  routingServerUrl,
  PUBLIC_ROUTING_URL,
  isPublicRouting,
} from "@territorio-vivo/core";
const key = "territorio-vivo.routing-server.v1";
// Solo la URL pública. Nunca claves ni coordenadas del viajero.
export function useRoutingServer() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false),
    [failed, setFailed] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    void AsyncStorage.getItem(key)
      .then((value) => {
        if (alive) {
          if (value === null) {
            setUrl(PUBLIC_ROUTING_URL);
            return;
          }
          try {
            setUrl(
              value === ""
                ? ""
                : isPublicRouting(value)
                  ? value
                  : routingServerUrl(value),
            );
          } catch {
            /* Una configuración inválida no se utiliza. */
          }
        }
      })
      .catch(() => {
        if (alive) setStorageFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  const connect = async (value: string) => {
    setBusy(true);
    setFailed(false);
    try {
      const server = await checkRoutingServer(value);
      await AsyncStorage.setItem(key, server.baseUrl);
      setUrl(server.baseUrl);
      return true;
    } catch {
      setFailed(true);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const disconnect = async () => {
    try {
      await AsyncStorage.setItem(key, "");
      setUrl("");
      setFailed(false);
    } catch {
      setStorageFailed(true);
    }
  };
  return {
    url,
    publicService: isPublicRouting(url),
    busy,
    failed,
    storageFailed,
    connect,
    disconnect,
    enable: () => connect(PUBLIC_ROUTING_URL),
  };
}
