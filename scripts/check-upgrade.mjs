import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [signer, badging, newMetadata] = process.argv.slice(2);
const meta = JSON.parse(readFileSync(newMetadata, "utf8"));
const repo = process.env.GITHUB_REPOSITORY;
assert.equal(repo, "cristobalrocosaavedra/conexion_emprende");
const gh = (args) =>
  execFileSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
const dir = mkdtempSync(join(tmpdir(), "tv-base-"));
let release = null;
try {
  release = JSON.parse(gh(["api", `repos/${repo}/releases/latest`]));
} catch (error) {
  if (!String(error.stderr).includes("404"))
    throw new Error("No fue posible consultar la APK anterior.", {
      cause: error,
    });
}
if (release) {
  gh([
    "release",
    "download",
    release.tag_name,
    "--repo",
    repo,
    "--pattern",
    "territorio-vivo-android.apk",
    "--dir",
    dir,
  ]);
} else {
  const old = JSON.parse(
    gh(["api", `repos/${repo}/actions/artifacts/12569897462`]),
  );
  if (old.expired) {
    process.stdout.write(
      "La APK base histórica expiró; se mantiene la verificación de identidad y certificado fijados.\n",
    );
    process.exit(0);
  }
  gh([
    "run",
    "download",
    "40117286924",
    "--repo",
    repo,
    "--name",
    "territorio-vivo-android-5",
    "--dir",
    dir,
  ]);
}
const apks = readdirSync(dir).filter((n) => n.endsWith(".apk"));
assert.equal(apks.length, 1, "La versión anterior debe contener una sola APK.");
const apk = join(dir, apks[0]);
const cert = execFileSync(signer, ["verify", "--print-certs", apk], {
  encoding: "utf8",
})
  .match(/Signer #1 certificate SHA-256 digest:\s*([a-f0-9:]+)/i)?.[1]
  .replaceAll(":", "")
  .toLowerCase();
const header =
  execFileSync(badging, ["dump", "badging", apk], { encoding: "utf8" })
    .split("\n")
    .find((l) => l.startsWith("package:")) ?? "";
const packageName = header.match(/name='([^']+)'/)?.[1];
const code = Number(header.match(/versionCode='(\d+)'/)?.[1]);
assert.equal(
  cert,
  meta.certificateSha256,
  "La nueva firma impediría actualizar encima de la app anterior.",
);
assert.equal(
  packageName,
  meta.packageName,
  "La nueva APK no es la misma aplicación.",
);
assert.ok(
  Number.isSafeInteger(code) && meta.versionCode > code,
  "El nuevo versionCode debe superar al anterior.",
);
process.stdout.write(
  `Actualización compatible por identidad/firma: compilación ${code} → ${meta.versionCode}. Instalación real pendiente de prueba en el teléfono.\n`,
);
