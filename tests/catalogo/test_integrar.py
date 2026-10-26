"""Pruebas con variaciones sintéticas rotuladas; no son fichas nuevas."""

import copy
import importlib.util
import json
import hashlib
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "integrar", ROOT / "scripts/catalogo/integrar.py"
)
m = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(m)


class IntegracionCatalogo(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = m.read_rows(
            m.AREA / "entrada/territorio_vivo_catalogo_maestro_consolidado.csv"
        )
        cls.before = m.baseline()
        cls.after, cls.audit = m.simulate(cls.rows, cls.before)

    def test_conserva_todo_el_catalogo_y_relaciones(self):
        self.assertEqual(len(self.before["entities"]), 130)
        for entity in self.before["entities"]:
            self.assertIn(entity, self.after["entities"])
        self.assertEqual(self.before["originals"], self.after["originals"])
        self.assertEqual(self.before["relations"], self.after["relations"])
        self.assertEqual(len(self.after["relations"]), 22)
        self.assertEqual(
            len({e["id"] for e in self.after["entities"]}), len(self.after["entities"])
        )
        # Pedegua existe como lugar y como localidad; la identidad incluye su tipo.
        self.assertIn(
            "legacy:places:pedegua", {e["id"] for e in self.after["entities"]}
        )
        self.assertIn(
            "legacy:localities:pedegua", {e["id"] for e in self.after["entities"]}
        )

    def test_respaldo_y_paquete_original_intactos(self):
        manifest = json.loads((m.AREA / "respaldo/manifest.json").read_text())
        for path, expected in manifest["files"].items():
            backup = m.AREA / "respaldo" / path
            if backup.exists():
                self.assertEqual(
                    hashlib.sha256(backup.read_bytes()).hexdigest(), expected, path
                )
            else:
                # Los recursos versionados tienen hash/commit; no se congela el código futuro.
                self.assertEqual(len(expected), 64)
        self.assertEqual(
            hashlib.sha256((m.AREA / "original.zip").read_bytes()).hexdigest(),
            manifest["paqueteSha256"],
        )

    def test_reporta_codigos_invalidos_sin_perder_filas(self):
        modified = copy.deepcopy(self.rows)
        modified[0]["codigo_region"] = "INVALIDO-EJEMPLO"
        state, audit = m.simulate(modified, self.before)
        report = m.summarize(modified, self.before, state, audit)
        self.assertEqual(report["inputRows"], 737)
        self.assertGreaterEqual(report["actions"]["quarantine"], 1)
        self.assertEqual(audit[0]["action"], "quarantine")
        self.assertIn("codigo-region-desconocido", audit[0]["issues"])

    def test_reimportacion_idempotente_y_sin_publicaciones(self):
        again, audit = m.simulate(self.rows, self.after)
        self.assertEqual(again, self.after)
        self.assertFalse(
            any(a["action"] in ("new-draft", "update-assertions") for a in audit)
        )
        self.assertTrue(
            all(e["review"]["publication"] == "draft" for e in again["entities"])
        )
        for item in self.after["proposals"]:
            self.assertFalse(
                any(e["id"] == item["candidate"]["id"] for e in self.after["entities"])
            )

    def test_coordenadas_vacias_invalidas_y_parciales(self):
        self.assertIsNone(m.coordinate("", ""))
        for lat, lon in [
            ("", "-70"),
            ("nan", "-70"),
            ("-30", "inf"),
            ("91", "-70"),
            ("-30", "-181"),
        ]:
            with self.assertRaises(ValueError):
                m.coordinate(lat, lon)
        self.assertEqual(m.coordinate("-32", "-71")["latitude"], -32)
        modified = copy.deepcopy(self.rows)
        modified[0]["latitud"] = "-999"
        result, audit = m.simulate(modified, self.before)
        self.assertEqual(audit[0]["action"], "quarantine")
        self.assertEqual(result["quarantine"][0]["raw"]["latitud"], "-999")

    def test_bom_columnas_e_ids_duplicados(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "ejemplo.csv"
            path.write_text(",".join(m.COLUMNS))
            with self.assertRaises(ValueError):
                m.read_rows(path)
            path.write_text("id,nombre\n1,Ejemplo\n", encoding="utf-8-sig")
            with self.assertRaises(ValueError):
                m.read_rows(path)
            raw = (
                m.AREA / "entrada/territorio_vivo_catalogo_maestro_consolidado.csv"
            ).read_bytes()
            path.write_bytes(raw + raw.splitlines(keepends=True)[1])
            with self.assertRaises(ValueError):
                m.read_rows(path)

    def test_identidad_externa_conserva_valores_verificados(self):
        incoming = copy.deepcopy(
            next(r for r in self.rows if r["tipo_registro"] == "atractivo")
        )
        initial = copy.deepcopy(self.after)
        target = next(
            e
            for e in initial["entities"]
            if {"source": "maestro-entregado", "id": incoming["id"]}
            in e["externalRefs"]
        )
        target["name"] = "Nombre de ejemplo verificado"
        target["fields"]["telefono"] = [
            {
                "raw": "teléfono de ejemplo",
                "source": "titular-de-ejemplo",
                "verifiedAt": "2026-10-01",
                "verification": "verified",
            }
        ]
        target["details"]["ownerEntityIds"] = ["owner:ejemplo"]
        target["review"]["status"] = "verified"
        original = copy.deepcopy(target)
        incoming["nombre"] = "Texto de ejemplo modificado"
        result, audit = m.simulate([incoming], initial)
        # La fila aislada exige su comuna; se acompaña su fila territorial.
        commune = next(
            r
            for r in self.rows
            if r["tipo_registro"] == "comuna"
            and r["comuna"] == incoming["comuna"]
            and r["codigo_region"] == incoming["codigo_region"]
        )
        result, audit = m.simulate([commune, incoming], initial)
        updated = next(e for e in result["entities"] if e["id"] == target["id"])
        self.assertEqual(updated["name"], original["name"])
        self.assertEqual(updated["fields"]["telefono"], original["fields"]["telefono"])
        self.assertEqual(updated["details"], original["details"])
        self.assertEqual(updated["review"], original["review"])
        self.assertEqual(audit[-1]["action"], "update-assertions")
        self.assertEqual(updated["assertions"][-1]["raw"]["nombre"], incoming["nombre"])
        self.assertEqual(m.simulate([commune, incoming], result)[0], result)

    def test_homonimos_en_distintas_comunas_y_conflictos_geograficos(self):
        existing = copy.deepcopy(
            next(e for e in self.before["entities"] if e["type"] == "attraction")
        )
        candidate = copy.deepcopy(existing)
        candidate["territoryIds"][-1] += "-otra-comuna-ejemplo"
        self.assertIsNone(m.matches(candidate, existing))
        candidate["territoryIds"] = existing["territoryIds"]
        candidate["location"] = m.coordinate("-18", "-70")
        self.assertTrue(m.matches(candidate, existing)["coordinateConflict"])
        # La comparación no altera ni fusiona los puntos.
        self.assertNotEqual(candidate["location"], existing["location"])

    def test_totales_cobertura_y_no_importa_base_auxiliar(self):
        report = m.summarize(self.rows, self.before, self.after, self.audit)
        self.assertEqual(report["inputRows"], 737)
        self.assertEqual(report["masterValidCoordinates"], 63)
        self.assertEqual(report["unchangedExistingEntities"], 130)
        self.assertEqual(report["actions"]["new-draft"], 713)
        self.assertEqual(report["actions"]["review-duplicate"], 24)
        self.assertEqual(
            [len(report["breakdown"][k]) for k in ("region", "province", "commune")],
            [16, 56, 346],
        )
        self.assertEqual(report["cutValidatedCommunes"], 0)
        self.assertEqual(
            len(report["communesWithoutAttractionsInAvailableInputs"]), 217
        )
        self.assertTrue(
            all(
                e["details"].get("cut") is None
                for e in self.after["entities"]
                if e["type"] == "territory"
            )
        )
        refs = [
            ref["id"]
            for e in self.after["entities"]
            for ref in e["externalRefs"]
            if ref["source"] == "maestro-entregado"
        ]
        refs += [p["id"] for p in self.after["proposals"]]
        self.assertEqual(len(refs), 737)
        self.assertEqual(len(set(refs)), 737)

    def test_rollback_restaura_bytes_y_rechaza_cambios_posteriores(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            state, journal, proposed = (
                root / "estado.json",
                root / "diario.json",
                root / "propuesto.json",
            )
            original = b'{"ejemplo": "conservar bytes"}\n'
            state.write_bytes(original)
            m.atomic_json(proposed, self.after)
            m.apply_staging(state, journal, proposed)
            m.rollback(state, journal)
            self.assertEqual(state.read_bytes(), original)
            journal.unlink()
            m.apply_staging(state, journal, proposed)
            state.write_text('{"ejemplo":"edición posterior"}')
            with self.assertRaises(ValueError):
                m.rollback(state, journal)
            self.assertIn("edición posterior", state.read_text())

    def test_rollback_de_estado_nuevo_y_rechazo_de_publicacion(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            state, journal, proposed = (
                root / "estado.json",
                root / "diario.json",
                root / "propuesto.json",
            )
            m.atomic_json(proposed, self.after)
            m.apply_staging(state, journal, proposed)
            m.rollback(state, journal)
            self.assertFalse(state.exists())
            published = copy.deepcopy(self.after)
            published["entities"][0]["review"]["publication"] = "published"
            m.atomic_json(proposed, published)
            with self.assertRaises(ValueError):
                m.apply_staging(state, root / "otro-diario.json", proposed)


if __name__ == "__main__":
    unittest.main()
