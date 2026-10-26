#!/usr/bin/env python3
"""Consolidación local y auditable. No contiene clientes HTTP, SQL ni publicación."""

import argparse
import copy
import csv
import difflib
import hashlib
import io
import json
import math
import os
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[2]
AREA = ROOT / "content/staging/catalogo-maestro"
COLUMNS = "id tipo_registro codigo_region region provincia comuna localidad nombre categoria subcategoria latitud longitud acceso estado_verificacion estado_publicacion fuente url_fuente notas id_fuente".split()
REGIONS = dict(
    zip(
        "XV I II III IV V RM VI VII XVI VIII IX XIV X XI XII".split(),
        "arica-parinacota tarapaca antofagasta atacama coquimbo valparaiso metropolitana ohiggins maule nuble biobio araucania los-rios los-lagos aysen magallanes".split(),
    )
)
CATEGORIES = {
    "territorio": "territorio",
    "Playa": "playa",
    "Atractivo natural": "naturaleza",
    "Ruta patrimonial": "cultura",
    "Parque urbano": "naturaleza",
    "Mirador": "naturaleza",
    "Humedal": "naturaleza",
    "Oasis": "naturaleza",
    "Sendero": "naturaleza",
    "Parque metropolitano": "naturaleza",
}
DATE = "2026-10-26"


def normalize(value):
    text = unicodedata.normalize("NFKD", str(value))
    return re.sub(
        r"[^a-z0-9]+",
        " ",
        "".join(c for c in text if not unicodedata.combining(c)).lower(),
    ).strip()


def slug(value):
    return normalize(value).replace(" ", "-")


def digest(value):
    return hashlib.sha256(value).hexdigest()


def json_bytes(value):
    return (
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode()


def atomic_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_bytes(json_bytes(value))
    os.replace(temporary, path)


def read_rows(path):
    raw = Path(path).read_bytes()
    if not raw.startswith(b"\xef\xbb\xbf"):
        raise ValueError("El CSV maestro debe conservar UTF-8 con BOM.")
    reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig"), newline=""))
    if reader.fieldnames != COLUMNS:
        raise ValueError("Columnas inesperadas, duplicadas o en orden diferente.")
    rows = list(reader)
    if not rows:
        raise ValueError("CSV sin registros.")
    seen = set()
    for row in rows:
        if None in row or any(v is None for v in row.values()):
            raise ValueError("Fila incompleta o con columnas extra.")
        if not row["id"] or row["id"] in seen:
            raise ValueError("ID vacío o repetido: " + row["id"])
        seen.add(row["id"])
    return rows


def coordinate(latitude, longitude):
    if latitude in ("", None) and longitude in ("", None):
        return None
    if latitude in ("", None) or longitude in ("", None):
        raise ValueError("Coordenada incompleta.")
    lat, lon = float(latitude), float(longitude)
    if (
        not math.isfinite(lat)
        or not math.isfinite(lon)
        or not -90 <= lat <= 90
        or not -180 <= lon <= 180
    ):
        raise ValueError("Coordenada fuera de rango o no finita.")
    return {"latitude": lat, "longitude": lon, "role": "reference-unverified"}


def distance(a, b):
    lat1, lat2 = math.radians(a["latitude"]), math.radians(b["latitude"])
    dlat = lat2 - lat1
    dlon = math.radians(b["longitude"] - a["longitude"])
    h = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    return 6371000 * 2 * math.asin(min(1, math.sqrt(h)))


def territorial_ids(region, province, commune):
    rid = "territory:region:" + region
    pid = rid + ":province:" + slug(province)
    cid = pid + ":commune:" + slug(commune)
    return rid, pid, cid


def claim(source, raw, imported_at=DATE):
    return {
        "source": source,
        "raw": copy.deepcopy(raw),
        "importedAt": imported_at,
        "verifiedAt": None,
        "verification": "pending",
    }


def entity(
    id_, kind, name, territory, category, location, assertion, details=None, legacy=None
):
    raw = assertion["raw"]
    return {
        "id": id_,
        "type": kind,
        "name": name,
        "territoryIds": list(territory),
        "categoryIds": [category],
        "location": location,
        "review": {"status": "pending", "publication": "draft"},
        "externalRefs": [],
        "fields": {k: [dict(assertion, raw=v)] for k, v in raw.items()},
        "assertions": [assertion],
        "details": details or {},
        "legacy": legacy,
    }


def baseline(root=ROOT):
    """Adapta TODO el snapshot, sin modificarlo ni afirmar nueva verificación."""
    petorca = json.loads((root / "content/catalogo/petorca.json").read_text())
    osm = json.loads((root / "content/catalogo/osm-chile.json").read_text())
    state = {
        "schemaVersion": 1,
        "entities": [],
        "proposals": [],
        "quarantine": [],
        "sources": {
            "petorca": {
                k: v
                for k, v in petorca.items()
                if k not in ("places", "localities", "routes")
            },
            "osm": {k: v for k, v in osm.items() if k != "places"},
            "maestro-entregado": {
                "license": "pending-review",
                "officialInventory": False,
            },
        },
        "originals": {
            "petorca": petorca,
            "osm": osm,
            "geography": json.loads(
                (root / "content/catalogo/regiones.geo.json").read_text()
            ),
        },
        "relations": [],
        "cutValidation": "pending-official-source",
    }
    for source, document in [("petorca", petorca), ("osm", osm)]:
        for row in document["places"]:
            region = row["region"]
            territory = territorial_ids(region, row["province"], row["commune"])
            kind = "business" if row["id"] == "chocolateria-matichoc" else "attraction"
            # La categoría gastronomía heredada no prueba que exista un restaurante.
            item = entity(
                "legacy:places:" + row["id"],
                kind,
                row["name"],
                territory,
                row["category"],
                coordinate(row.get("latitude"), row.get("longitude")),
                claim(source, row, row["importedAt"]),
                legacy={
                    "collection": "places",
                    "id": row["id"],
                    "source": source,
                    "visibleInLegacyApp": True,
                },
            )
            item["externalRefs"] = [{"source": "legacy:places", "id": row["id"]}]
            if source == "osm":
                sr = row["sourceRecord"]
                item["externalRefs"].append(
                    {"source": "osm", "id": sr["type"] + "/" + sr["id"]}
                )
            state["entities"].append(item)
    for row in petorca["localities"]:
        territory = territorial_ids("valparaiso", "petorca", row["commune"])
        state["entities"].append(
            entity(
                "legacy:localities:" + row["id"],
                "territory",
                row["name"],
                territory,
                "territorio",
                coordinate(row["latitude"], row["longitude"]),
                claim("petorca", row, petorca["provenance"].get("importedAt", DATE)),
                {"level": "locality", "parentId": territory[-1], "cut": None},
                {"collection": "localities", "id": row["id"]},
            )
        )
    for row in petorca["routes"]:
        route_territories = sorted(
            {
                t
                for e in state["entities"]
                if e["id"] in {"legacy:places:" + id_ for id_ in row["stopIds"]}
                for t in e["territoryIds"]
            }
        )
        item = entity(
            "legacy:routes:" + row["id"],
            "route",
            row["name"],
            route_territories,
            "ruta",
            None,
            claim("petorca", row),
            {
                "stops": [
                    {"entityId": "legacy:places:" + id_, "position": i}
                    for i, id_ in enumerate(row["stopIds"])
                ]
            },
            {"collection": "routes", "id": row["id"]},
        )
        state["entities"].append(item)
        state["relations"].extend(
            {
                "from": item["id"],
                "to": stop["entityId"],
                "type": "route-stop",
                "position": stop["position"],
            }
            for stop in item["details"]["stops"]
        )
    return state


def validate_row(row, communes):
    issues = []
    if row["tipo_registro"] not in ("comuna", "localidad", "atractivo"):
        issues.append("tipo-desconocido")
    if row["codigo_region"] not in REGIONS:
        issues.append("codigo-region-desconocido")
    if not all(
        row[k].strip()
        for k in (
            "region",
            "provincia",
            "comuna",
            "nombre",
            "fuente",
            "estado_verificacion",
        )
    ):
        issues.append("campo-obligatorio-vacio")
    if row["categoria"] not in CATEGORIES:
        issues.append("categoria-desconocida")
    if row["tipo_registro"] in ("comuna", "localidad") and (
        row["categoria"] != "territorio" or row["subcategoria"] != row["tipo_registro"]
    ):
        issues.append("tipo-categoria-incoherentes")
    if row["estado_publicacion"] not in ("candidato", "revisar", "pendiente"):
        issues.append("estado-publicacion-no-autorizado")
    if row["url_fuente"] and not row["url_fuente"].startswith("https://"):
        issues.append("fuente-url-no-https")
    key = (row["codigo_region"], normalize(row["provincia"]), normalize(row["comuna"]))
    if row["tipo_registro"] != "comuna" and key not in communes:
        issues.append("comuna-no-presente-en-maestro")
    try:
        location = coordinate(row["latitud"], row["longitud"])
    except ValueError:
        location = None
        issues.append("coordenada-invalida")
    return issues, location


def matches(candidate, other):
    if (
        candidate["type"] != other["type"]
        or candidate["territoryIds"] != other["territoryIds"]
        or not set(candidate["categoryIds"]) & set(other["categoryIds"])
    ):
        return None
    if candidate["type"] == "territory" and candidate["details"].get("level") != other[
        "details"
    ].get("level"):
        return None
    a, b = normalize(candidate["name"]), normalize(other["name"])
    similarity = difflib.SequenceMatcher(None, a, b).ratio()
    if a != b and (similarity < 0.86 or min(len(a), len(b)) < 8):
        return None
    meters = None
    if candidate["location"] and other["location"]:
        meters = round(distance(candidate["location"], other["location"]))
    return {
        "entityId": other["id"],
        "name": other["name"],
        "reason": "same-name-territory-category"
        if a == b
        else "similar-name-territory-category",
        "distanceMeters": meters,
        "coordinateConflict": meters is not None and meters > 500,
    }


def add_assertion(target, assertion):
    if assertion in target["assertions"]:
        return False
    target["assertions"].append(copy.deepcopy(assertion))
    for key, value in assertion["raw"].items():
        target["fields"].setdefault(key, []).append(dict(assertion, raw=value))
    # Las afirmaciones nuevas no sustituyen valores canónicos ni verificados.
    return True


def simulate(rows, initial):
    state = copy.deepcopy(initial)
    communes = {
        (r["codigo_region"], normalize(r["provincia"]), normalize(r["comuna"]))
        for r in rows
        if r["tipo_registro"] == "comuna"
    }
    audits = []
    declared_regions = {
        code: {
            normalize(r["region"])
            for r in rows
            if r["tipo_registro"] == "comuna" and r["codigo_region"] == code
        }
        for code in REGIONS
    }
    commune_ids = [
        (r["codigo_region"], normalize(r["comuna"]))
        for r in rows
        if r["tipo_registro"] == "comuna"
    ]
    for row in rows:
        issues, location = validate_row(row, communes)
        if (
            normalize(row["region"])
            not in declared_regions.get(row["codigo_region"], set())
            or len(declared_regions.get(row["codigo_region"], set())) != 1
        ):
            issues.append("region-incoherente-en-maestro")
        if commune_ids.count((row["codigo_region"], normalize(row["comuna"]))) != 1:
            issues.append("comuna-ambigua-en-maestro")
        audit = {
            "id": row["id"],
            "region": row["region"],
            "province": row["provincia"],
            "commune": row["comuna"],
            "type": row["tipo_registro"],
            "name": row["nombre"],
            "validCoordinates": location is not None,
            "issues": issues,
        }
        audits.append(audit)
        assertion = claim("maestro-entregado", row)
        if issues:
            key = digest(json_bytes(row))
            if not any(x["key"] == key for x in state["quarantine"]):
                state["quarantine"].append({"key": key, "raw": row, "issues": issues})
            audit["action"] = "quarantine"
            continue
        region = REGIONS[row["codigo_region"]]
        rid, pid, cid = territorial_ids(region, row["provincia"], row["comuna"])
        # Región/provincia derivadas del maestro; códigos CUT siempre vacíos.
        for id_, name, level, parent in [
            (rid, row["region"], "region", None),
            (pid, row["provincia"], "province", rid),
        ]:
            existing = next((e for e in state["entities"] if e["id"] == id_), None)
            if not existing:
                state["entities"].append(
                    entity(
                        id_,
                        "territory",
                        name,
                        [parent] if parent else [],
                        "territorio",
                        None,
                        assertion,
                        {"level": level, "parentId": parent, "cut": None},
                    )
                )
        level = row["tipo_registro"]
        details = (
            {
                "level": "commune" if level == "comuna" else "locality",
                "parentId": pid if level == "comuna" else cid,
                "cut": None,
            }
            if level != "atractivo"
            else {
                "access": {
                    "publicNature": "unknown",
                    "isFree": None,
                    "practicalAccess": "unverified",
                    "fees": None,
                },
                "declaredAccess": row["acceso"],
            }
        )
        id_ = cid if level == "comuna" else "master:" + row["id"]
        territory = [rid, pid, cid]
        candidate = entity(
            id_,
            "attraction" if level == "atractivo" else "territory",
            row["nombre"],
            territory,
            CATEGORIES[row["categoria"]],
            location,
            assertion,
            details,
        )
        refs = [{"source": "maestro-entregado", "id": row["id"]}]
        if row["id_fuente"]:
            refs.append({"source": "editorial-paquete", "id": row["id_fuente"]})
        candidate["externalRefs"] = refs
        exact = [
            e
            for e in state["entities"]
            if any(ref in e["externalRefs"] for ref in refs)
        ]
        if len(exact) > 1:
            audit.update(
                action="conflict", matches=[{"entityId": e["id"]} for e in exact]
            )
            if not any(p["id"] == row["id"] for p in state["proposals"]):
                state["proposals"].append(
                    {
                        "id": row["id"],
                        "candidate": candidate,
                        "matches": audit["matches"],
                        "reason": "ambiguous-external-id",
                    }
                )
            continue
        if exact:
            audit["entityId"] = exact[0]["id"]
            audit["action"] = (
                "update-assertions"
                if add_assertion(exact[0], assertion)
                else "unchanged"
            )
            if audit["action"] == "update-assertions":
                audit["issues"].append("changed-source-preserve-canonical-review")
            continue
        proposal = next((p for p in state["proposals"] if p["id"] == row["id"]), None)
        if proposal:
            changed = add_assertion(proposal["candidate"], assertion)
            audit.update(
                action="proposal-updated" if changed else "unchanged-proposal",
                matches=proposal["matches"],
            )
            continue
        collisions = [m for e in state["entities"] if (m := matches(candidate, e))]
        # Comparar también con propuestas retenidas evita materializar su duplicado.
        collisions += [
            dict(m, proposalId=p["id"])
            for p in state["proposals"]
            if (m := matches(candidate, p["candidate"]))
        ]
        if collisions:
            state["proposals"].append(
                {
                    "id": row["id"],
                    "candidate": candidate,
                    "matches": collisions,
                    "reason": "manual-review",
                }
            )
            audit.update(action="review-duplicate", matches=collisions)
        else:
            state["entities"].append(candidate)
            audit.update(action="new-draft", entityId=id_)
    ids = {e["id"] for e in state["entities"]}
    if len(ids) != len(state["entities"]):
        raise ValueError("Colisión interna de identificadores; no se genera estado.")
    if any(r["from"] not in ids or r["to"] not in ids for r in state["relations"]):
        raise ValueError("Relación de ruta colgante.")
    return state, audits


def summarize(rows, initial, state, audits):
    def counts(items):
        return {
            k: sum(a["action"] == k for a in items)
            for k in (
                "new-draft",
                "update-assertions",
                "review-duplicate",
                "conflict",
                "quarantine",
                "unchanged",
                "unchanged-proposal",
                "proposal-updated",
            )
        }

    groups = {}
    for level, columns in [
        ("region", ("region",)),
        ("province", ("region", "province")),
        ("commune", ("region", "province", "commune")),
    ]:
        keys = sorted({tuple(a[k] for k in columns) for a in audits})
        groups[level] = []
        row_lookup = {r["id"]: r for r in rows}
        for key in keys:
            part = [a for a in audits if tuple(a[k] for k in columns) == key]
            first = row_lookup[part[0]["id"]]
            scope = territorial_ids(
                REGIONS.get(first["codigo_region"], "invalid-region"),
                first["provincia"],
                first["comuna"],
            )[["region", "province", "commune"].index(level)]
            preexisting = [e for e in initial["entities"] if scope in e["territoryIds"]]
            groups[level].append(
                dict(
                    zip(columns, key),
                    rows=len(part),
                    coordinates=sum(a["validCoordinates"] for a in part),
                    existingPlaces=sum(
                        (e.get("legacy") or {}).get("collection") == "places"
                        for e in preexisting
                    ),
                    existingLocalities=sum(
                        (e.get("legacy") or {}).get("collection") == "localities"
                        for e in preexisting
                    ),
                    existingRoutes=sum(e["type"] == "route" for e in preexisting),
                    pendingCUT=sum(a["type"] == "comuna" for a in part),
                    coordinateConflicts=sum(
                        any(m.get("coordinateConflict") for m in a.get("matches", []))
                        for a in part
                    ),
                    **counts(part),
                )
            )
    without = []
    for row in rows:
        if row["tipo_registro"] != "comuna":
            continue
        territory = territorial_ids(
            REGIONS.get(row["codigo_region"], "invalid-region"),
            row["provincia"],
            row["comuna"],
        )
        existing = sum(
            e["type"] == "attraction" and tuple(e["territoryIds"]) == territory
            for e in initial["entities"]
        )
        incoming = sum(
            r["tipo_registro"] == "atractivo"
            and (r["codigo_region"], normalize(r["provincia"]), normalize(r["comuna"]))
            == (
                row["codigo_region"],
                normalize(row["provincia"]),
                normalize(row["comuna"]),
            )
            for r in rows
        )
        if not existing and not incoming:
            without.append(
                {
                    "region": row["region"],
                    "province": row["provincia"],
                    "commune": row["comuna"],
                }
            )
    return {
        "schemaVersion": 1,
        "date": DATE,
        "mode": "simulation-no-publication",
        "existing": {
            "places": sum(
                (e.get("legacy") or {}).get("collection") == "places"
                for e in initial["entities"]
            ),
            "localities": sum(
                (e.get("legacy") or {}).get("collection") == "localities"
                for e in initial["entities"]
            ),
            "routes": len(initial["originals"]["petorca"]["routes"]),
            "routeRelations": len(initial["relations"]),
        },
        "inputRows": len(rows),
        "actions": counts(audits),
        "derivedRegionProvinceNodes": len(
            [
                e
                for e in state["entities"]
                if e["type"] == "territory"
                and e["details"].get("level") in ("region", "province")
            ]
        ),
        "existingValidCoordinates": sum(
            e["location"] is not None for e in initial["entities"]
        ),
        "masterValidCoordinates": sum(a["validCoordinates"] for a in audits),
        "unchangedExistingEntities": sum(
            e in state["entities"] for e in initial["entities"]
        ),
        "coordinateConflicts": sum(
            any(m.get("coordinateConflict") for m in a.get("matches", []))
            for a in audits
        ),
        "entitiesInProposedState": len(state["entities"]),
        "publications": 0,
        "cutValidatedCommunes": 0,
        "pendingCUTCommunes": sum(r["tipo_registro"] == "comuna" for r in rows),
        "communesWithoutAttractionsInAvailableInputs": without,
        "breakdown": groups,
        "validationPending": [
            "CUT SUBDERE: fuente oficial no descargada; nombres/códigos/jerarquía sin validar",
            "Licencias y vigencia del maestro editorial",
            "Coordenadas de referencia, no accesos comprobados",
            "Inventario SERNATUR/MMA no descargado: sin CRS/licencia/atributos contrastados",
            "CSV original con localidades separadas por | no disponible; expansión no exhaustiva",
            "Revisión manual de coincidencias; no se fusionan homónimos",
        ],
        "audit": audits,
    }


def write_report(output, report):
    output.mkdir(parents=True, exist_ok=True)
    atomic_json(output / "reporte.json", report)
    for level, rows in report["breakdown"].items():
        with (output / ("desglose-" + level + ".csv")).open(
            "w", encoding="utf-8-sig", newline=""
        ) as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)
    with (output / "coincidencias.csv").open(
        "w", encoding="utf-8-sig", newline=""
    ) as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "id",
                "name",
                "region",
                "province",
                "commune",
                "matchedId",
                "matchedName",
                "reason",
                "distanceMeters",
                "coordinateConflict",
            ],
        )
        writer.writeheader()
        for audit in report["audit"]:
            for match in audit.get("matches", []):
                writer.writerow(
                    {
                        **{
                            k: audit[k]
                            for k in ("id", "name", "region", "province", "commune")
                        },
                        "matchedId": match["entityId"],
                        "matchedName": match.get("name", ""),
                        "reason": match.get("reason", "external-id-conflict"),
                        "distanceMeters": match.get("distanceMeters"),
                        "coordinateConflict": match.get("coordinateConflict", False),
                    }
                )
    with (output / "comunas-sin-atractivos.csv").open(
        "w", encoding="utf-8-sig", newline=""
    ) as f:
        writer = csv.DictWriter(f, fieldnames=["region", "province", "commune"])
        writer.writeheader()
        writer.writerows(report["communesWithoutAttractionsInAvailableInputs"])
    lines = [
        "# Simulación del catálogo maestro",
        "",
        "No publica registros ni modifica la app. El catálogo original queda intacto.",
        "",
        f"Entrada: {report['inputRows']} filas; coordenadas numéricamente válidas: {report['masterValidCoordinates']}. CUT contrastadas: 0 / {report['pendingCUTCommunes']}.",
        "",
        f"Existentes: {report['existing']['places']} lugares, {report['existing']['localities']} localidades, {report['existing']['routes']} rutas; {report['existing']['routeRelations']} relaciones de paradas preservadas.",
        "",
        "| Acción sobre filas del maestro | Total |",
        "| --- | ---: |",
    ]
    lines += [f"| {key} | {value} |" for key, value in report["actions"].items()]
    lines += [
        "",
        f"Conflictos de coordenadas entre coincidencias: {report['coordinateConflicts']}. Actualizados en el catálogo existente: 0.",
        "",
        f"Además: {report['derivedRegionProvinceNodes']} nodos de región/provincia derivados. Comunas sin atractivos en los insumos disponibles: {len(report['communesWithoutAttractionsInAvailableInputs'])}. No significa que no tengan atractivos reales.",
        "",
        "## Coincidencias retenidas para revisión",
        "",
        "| ID del maestro | Nombre | Coincidencias | Distancia de referencia (m) |",
        "| --- | --- | --- | --- |",
    ]
    by_id = {p["id"]: p for p in report["audit"]}
    for audit in by_id.values():
        if audit.get("matches"):
            lines.append(
                "| "
                + audit["id"]
                + " | "
                + audit["name"]
                + " | "
                + ", ".join(m.get("name", m["entityId"]) for m in audit["matches"])
                + " | "
                + ", ".join(
                    str(m["distanceMeters"])
                    if m.get("distanceMeters") is not None
                    else "sin coordenadas comparables"
                    for m in audit["matches"]
                )
                + " |"
            )
    lines += ["", "## Pendientes antes de publicar", ""] + [
        "- " + item for item in report["validationPending"]
    ]
    lines += [
        "",
        "Detalle completo por región/provincia/comuna en CSV adjuntos; decisiones por fila en reporte.json. Estado candidato en estado-propuesto.json; no es un archivo consumido por la app.",
        "",
    ]
    (output / "REPORTE.md").write_text("\n".join(lines))


def apply_staging(state_path, journal_path, proposed_path):
    """Solo desarrollo: reemplazo reversible con comparación de contenido."""
    state_path, journal_path, proposed_path = map(
        Path, (state_path, journal_path, proposed_path)
    )
    if journal_path.exists():
        raise ValueError("El diario ya existe: conservarlo y usar uno nuevo.")
    proposed = json.loads(proposed_path.read_text())
    if proposed.get("schemaVersion") != 1 or any(
        e["review"]["publication"] != "draft" for e in proposed["entities"]
    ):
        raise ValueError("Solo se admiten candidatos draft de esquema 1.")
    previous = state_path.read_bytes() if state_path.exists() else None
    new = json_bytes(proposed)
    atomic_json(
        journal_path,
        {
            "before": previous.decode() if previous is not None else None,
            "afterSha256": digest(new),
            "statePath": str(state_path.resolve()),
        },
    )
    atomic_json(state_path, proposed)


def rollback(state_path, journal_path):
    state_path, journal_path = Path(state_path), Path(journal_path)
    journal = json.loads(journal_path.read_text())
    if (
        journal["statePath"] != str(state_path.resolve())
        or not state_path.exists()
        or digest(state_path.read_bytes()) != journal["afterSha256"]
    ):
        raise ValueError("El estado cambió después de integrar; no se sobrescribe.")
    if journal["before"] is None:
        state_path.unlink()
    else:
        temporary = state_path.with_name(state_path.name + ".tmp")
        temporary.write_text(journal["before"])
        os.replace(temporary, state_path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["simulate", "apply-staging", "rollback"])
    parser.add_argument(
        "--input",
        type=Path,
        default=AREA / "entrada/territorio_vivo_catalogo_maestro_consolidado.csv",
    )
    parser.add_argument("--output", type=Path, default=AREA / "simulacion")
    parser.add_argument("--state", type=Path)
    parser.add_argument("--journal", type=Path)
    args = parser.parse_args()
    if args.command == "simulate":
        initial = json.loads(args.state.read_text()) if args.state else baseline()
        rows = read_rows(args.input)
        proposed, audit = simulate(rows, initial)
        report = summarize(rows, initial, proposed, audit)
        write_report(args.output, report)
        atomic_json(args.output / "estado-propuesto.json", proposed)
        print(
            json.dumps(
                {
                    k: v
                    for k, v in report.items()
                    if k
                    in (
                        "existing",
                        "inputRows",
                        "actions",
                        "masterValidCoordinates",
                        "entitiesInProposedState",
                        "publications",
                    )
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        if not args.state or not args.journal:
            parser.error(
                "--state y --journal son obligatorios y solo admiten archivos de staging."
            )
        # Ninguna operación de escritura puede apuntar al catálogo servido.
        allowed = (AREA / "trabajo").resolve()
        for path in (args.state, args.journal):
            if (
                not path.resolve().is_relative_to(allowed)
                or path.resolve().is_relative_to((AREA / "entrada").resolve())
                or path.resolve().is_relative_to((AREA / "respaldo").resolve())
            ):
                parser.error(
                    "Escritura permitida solo en staging, fuera de originales y respaldo."
                )
        if args.state.resolve() == args.journal.resolve():
            parser.error("Estado y diario deben ser archivos diferentes.")
        if args.command == "apply-staging":
            apply_staging(
                args.state, args.journal, args.output / "estado-propuesto.json"
            )
        else:
            rollback(args.state, args.journal)


if __name__ == "__main__":
    main()
