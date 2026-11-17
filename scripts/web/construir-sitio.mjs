// Construye el sitio completo para Cloudflare Pages:
// 1) sitio Next.js estático en apps/web/out
// 2) app de mapa y rutas (Expo web) dentro de apps/web/out/explorar
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = path.join(root, "apps/web/out");
const run = (command, env = {}) =>
  execSync(command, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", ...env },
  });

run("pnpm --filter @territorio-vivo/web build");
const explore = path.join(out, "explorar");
if (existsSync(explore)) rmSync(explore, { recursive: true });
run(
  `pnpm --filter @territorio-vivo/mobile exec expo export --platform web --max-workers 2 --output-dir "${explore}"`,
  { EXPO_BASE_URL: "/explorar" },
);
console.log("Sitio listo en apps/web/out (con la app de rutas en /explorar)");
