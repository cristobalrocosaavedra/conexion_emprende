import assert from "node:assert/strict";
import { readApkCertificate } from "./apk-certificate.mjs";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const [certificatePath, badgingPath, apkPath, outputPath] =
  process.argv.slice(2);
const identity = JSON.parse(
  readFileSync("apps/mobile/app-identity.json", "utf8"),
);
const certificate = readApkCertificate(readFileSync(certificatePath, "utf8"));
assert.equal(
  certificate,
  identity.testCertificateSha256,
  "La firma cambió: no se publicará una APK incompatible con la app base.",
);
const header =
  readFileSync(badgingPath, "utf8")
    .split("\n")
    .find((line) => line.startsWith("package:")) ?? "";
const packageName = header.match(/name='([^']+)'/)?.[1];
const versionCode = Number(header.match(/versionCode='(\d+)'/)?.[1]);
const version = header.match(/versionName='([^']+)'/)?.[1];
assert.equal(
  packageName,
  identity.androidPackage,
  "Cambió el identificador de la app.",
);
assert.equal(
  versionCode,
  Number(process.env.TV_ANDROID_VERSION_CODE),
  "El APK no tiene el número incremental esperado.",
);
assert.equal(
  version,
  JSON.parse(readFileSync("apps/mobile/package.json", "utf8")).version,
  "La versión no coincide con el proyecto.",
);
const bytes = readFileSync(apkPath);
writeFileSync(
  outputPath,
  JSON.stringify(
    {
      version,
      versionCode,
      packageName,
      certificateSha256: certificate,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      size: bytes.length,
      commit: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
    },
    null,
    2,
  ) + "\n",
);
