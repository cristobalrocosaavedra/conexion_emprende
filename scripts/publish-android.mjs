import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
assert.equal(
  process.env.GITHUB_EVENT_NAME,
  "push",
  "El canal solo se publica tras un push revisado a develop.",
);
assert.equal(
  process.env.GITHUB_REF,
  "refs/heads/develop",
  "Un PR no puede reemplazar el canal compartido.",
);
const repo = process.env.GITHUB_REPOSITORY;
assert.match(repo ?? "", /^[\w.-]+\/[\w.-]+$/, "Repositorio no válido.");
const dir = "artefactos",
  meta = JSON.parse(readFileSync(join(dir, "version.json"), "utf8"));
assert.ok(
  Number.isSafeInteger(meta.versionCode) && meta.versionCode > 0,
  "Versión incremental no válida.",
);
const identity = JSON.parse(
  readFileSync("apps/mobile/app-identity.json", "utf8"),
);
assert.equal(meta.packageName, identity.androidPackage);
assert.equal(meta.certificateSha256, identity.testCertificateSha256);
assert.equal(
  createHash("sha256")
    .update(readFileSync(join(dir, "territorio-vivo-android.apk")))
    .digest("hex"),
  meta.sha256,
  "El APK no coincide con su checksum.",
);
assert.match(
  meta.version,
  /^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/,
  "Versión no válida.",
);
for (const name of [
  "pantalla-inicio.png",
  "pantalla-ruta.png",
  "pantalla-mapa.png",
])
  assert.equal(
    readFileSync(join("docs/diseno", meta.version, name))
      .subarray(0, 8)
      .toString("hex"),
    "89504e470d0a1a0a",
    "Falta una vista previa válida de la versión.",
  );
const gh = (args) =>
  execFileSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
const api = (path) => JSON.parse(gh(["api", `repos/${repo}/${path}`]));
const temp = mkdtempSync(join(tmpdir(), "tv-release-"));
let latest = null;
try {
  latest = api("releases/latest");
} catch (error) {
  if (!String(error.stderr).includes("404"))
    throw new Error(
      "No fue posible consultar la última versión. Se conserva el canal actual.",
      { cause: error },
    );
}
if (latest) {
  gh([
    "release",
    "download",
    latest.tag_name,
    "--repo",
    repo,
    "--pattern",
    "version.json",
    "--dir",
    temp,
  ]);
  const previous = JSON.parse(readFileSync(join(temp, "version.json"), "utf8"));
  assert.ok(
    Number.isSafeInteger(previous.versionCode),
    "La versión compartida no tiene metadatos válidos.",
  );
  if (previous.versionCode >= meta.versionCode) {
    process.stdout.write(
      "El canal ya tiene esta versión o una posterior; no se reemplaza.\n",
    );
    process.exit(0);
  }
}
const tag = `android-v${meta.version}-c${meta.versionCode}`;
const existing = api("releases?per_page=100").find((r) => r.tag_name === tag);
if (existing && !existing.draft)
  throw new Error("La versión ya publicada es inmutable.");
const releaseNotes = `## Versión de pruebas ${meta.version} · compilación ${meta.versionCode}\n\nDescargar únicamente **territorio-vivo-android.apk**. Las capturas están [en el repositorio](https://github.com/${repo}/tree/${meta.commit}/docs/diseno/${meta.version}), separadas de la instalación.\n\nCatálogo de referencia pendiente de verificación. Rutas públicas temporales dentro de la app; el proveedor recibe y registra las consultas. Consultar [configuración y estado](https://github.com/${repo}/blob/${meta.commit}/docs/RUTEO-PUBLICO-DE-PRUEBAS.md) antes de intentar calcular rutas. Servicio de pruebas sin disponibilidad garantizada.\n\nLa actualización conserva la app base cuando coinciden firma e identificador. Android puede pedir autorización de la fuente; no requiere desinstalar ni permisos de administrador.\n\nDatos abiertos y licencia: [procedencia OSM](https://github.com/${repo}/blob/${meta.commit}/content/sources/OSM-CHILE.md).\n\nCódigo: ${meta.commit}.\n`;
const body = {
  tag_name: tag,
  target_commitish: meta.commit,
  name: `Territorio Vivo ${meta.version} · Android de pruebas`,
  body: releaseNotes,
  draft: true,
  prerelease: false,
};
const createPath = join(temp, "release.json");
writeFileSync(createPath, JSON.stringify(body));
const release =
  existing ??
  JSON.parse(
    gh([
      "api",
      "--method",
      "POST",
      `repos/${repo}/releases`,
      "--input",
      createPath,
    ]),
  );
meta.releaseTag = tag;
meta.downloadUrl = `https://github.com/${repo}/releases/latest/download/territorio-vivo-android.apk`;
writeFileSync(join(dir, "version.json"), JSON.stringify(meta, null, 2) + "\n");
const assets = readdirSync(dir)
  .filter((name) =>
    [
      "territorio-vivo-android.apk",
      "version.json",
      "SHA256SUMS.txt",
      "COMMIT.txt",
    ].includes(name),
  )
  .map((name) => join(dir, name));
gh(["release", "upload", tag, "--repo", repo, ...assets, "--clobber"]);
const publishPath = join(temp, "publish.json");
writeFileSync(
  publishPath,
  JSON.stringify({ draft: false, make_latest: "true", body: releaseNotes }),
);
gh([
  "api",
  "--method",
  "PATCH",
  `repos/${repo}/releases/${release.id}`,
  "--input",
  publishPath,
]);
process.stdout.write(`Última versión compartida: ${meta.downloadUrl}\n`);
