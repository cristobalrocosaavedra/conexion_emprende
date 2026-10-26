/** Contrato candidato, sin conexión con el catálogo visible de la maqueta. */
export type MasterEntityType =
  | "territory"
  | "attraction"
  | "business"
  | "restaurant"
  | "lodging"
  | "experience"
  | "route"
  | "event"
  | `extension:${string}`;

export interface FieldAssertion {
  source: string;
  raw: unknown;
  importedAt: string;
  verifiedAt: string | null;
  verification: "pending" | "verified" | "outdated" | "rejected";
}
export interface TerritoryDetails {
  level: "region" | "province" | "commune" | "locality";
  parentId: string | null;
  /** Solo se completa tras contraste con una edición identificada de CUT. */
  cut: string | null;
}
export interface AccessDetails {
  publicNature: "public" | "private" | "mixed" | "unknown";
  isFree: boolean | null;
  practicalAccess: "unverified" | "open" | "restricted" | "closed";
  fees: { amount: number; currency: string; conditions: string }[] | null;
}
export interface BusinessDetails {
  ownerEntityIds: string[];
  publicContacts: { type: string; value: string }[];
  openingHours: unknown | null;
}
export interface EventDetails {
  startsAt: string | null;
  endsAt: string | null;
  timeZone: string | null;
  organizerEntityIds: string[];
  venueEntityId: string | null;
  status: "unconfirmed" | "scheduled" | "cancelled" | "postponed";
}
export interface RouteDetails {
  stops: { entityId: string; position: number }[];
}
interface EntityBase {
  id: string;
  name: string;
  /** Permite varias comunas/regiones para parques, rutas y experiencias. */
  territoryIds: string[];
  categoryIds: string[];
  location: {
    latitude: number;
    longitude: number;
    role: "reference-unverified" | "reference" | "verified-access";
  } | null;
  review: {
    status: "pending" | "verified" | "outdated" | "rejected";
    publication: "draft" | "published" | "archived";
  };
  externalRefs: { source: string; id: string }[];
  fields: Record<string, FieldAssertion[]>;
  assertions: FieldAssertion[];
  legacy: {
    collection: string;
    id: string;
    source?: string;
    visibleInLegacyApp?: boolean;
  } | null;
}
export type MasterEntity = EntityBase &
  (
    | { type: "territory"; details: TerritoryDetails }
    | {
        type: "attraction";
        details: { access?: AccessDetails; declaredAccess?: string };
      }
    | {
        type: "business" | "restaurant" | "lodging";
        details: Partial<BusinessDetails>;
      }
    | { type: "event"; details: EventDetails }
    | { type: "route"; details: RouteDetails }
    | {
        type: "experience" | `extension:${string}`;
        details: Record<string, unknown>;
      }
  );
export interface MasterCatalog {
  schemaVersion: 1;
  entities: MasterEntity[];
  proposals: {
    id: string;
    candidate: MasterEntity;
    reason: string;
    matches: {
      entityId: string;
      distanceMeters?: number | null;
      coordinateConflict?: boolean;
    }[];
  }[];
  quarantine: { key: string; raw: unknown; issues: string[] }[];
  sources: Record<string, unknown>;
  originals: Record<string, unknown>;
  relations: { from: string; to: string; type: string; position?: number }[];
  cutValidation: "pending-official-source" | "validated";
}
