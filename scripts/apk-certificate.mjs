import assert from "node:assert/strict";

/**
 * apksigner identifica firmantes por número, intervalo SDK o esquema (Android 37).
 * Se exige una única identidad, incluso si aparece en varios intervalos.
 * Referencia de formato: ApkSignerTool.java, printCertificate/verify.
 */
export function readApkCertificate(output) {
  const lines = output
    .split(/\r?\n/)
    .filter((line) =>
      /^(?:Signer|V\d+(?:\.\d+)? Signer).*certificate SHA-256 digest:/i.test(
        line,
      ),
    );
  const certificates = lines.map((line) => {
    const match = line.match(
      /^(?:Signer (?:#\d+|\([^\r\n]+\))|V2 Signer:) certificate SHA-256 digest:\s*([a-f0-9:]+)\s*$/i,
    );
    assert.ok(match, "Formato de certificado de apksigner no reconocido.");
    return match[1].replaceAll(":", "").toLowerCase();
  });
  assert.ok(
    certificates.length,
    "No se pudo leer el certificado de apksigner.",
  );
  assert.ok(
    certificates.every((value) => /^[a-f0-9]{64}$/.test(value)),
    "El certificado no tiene un SHA-256 válido.",
  );
  assert.equal(
    new Set(certificates).size,
    1,
    "La APK contiene distintas identidades de firma; no se admite cambiar la base.",
  );
  return certificates[0];
}
