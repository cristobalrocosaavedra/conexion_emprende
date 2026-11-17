// Copia al sitio web las ilustraciones y marcas ya registradas en la app (sin duplicarlas en git).
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const target = path.join(root, "apps/web/public/arte");
mkdirSync(target, { recursive: true });
const assets = path.join(root, "apps/mobile/assets");
const collection = path.join(assets, "territorio/coleccion");
for (const file of readdirSync(collection).filter((f) => f.endsWith(".webp")))
  copyFileSync(path.join(collection, file), path.join(target, file));
for (const file of [
  "territorio/matichoc-logo.webp",
  "marca/turismo-en-tu-mano-icono.webp",
  "marca/turismo-en-tu-mano-icono.png",
])
  copyFileSync(path.join(assets, file), path.join(target, path.basename(file)));
console.log("Arte copiado en apps/web/public/arte");
