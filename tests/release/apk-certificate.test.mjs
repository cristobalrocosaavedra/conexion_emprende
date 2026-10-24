import { describe, expect, it } from "vitest";
import { readApkCertificate } from "../../scripts/apk-certificate.mjs";
const cert = "fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c";
describe("identidad de firma de APK", () => {
  it("lee el formato numerado tradicional", () => {
    expect(
      readApkCertificate(`Signer #1 certificate SHA-256 digest: ${cert}\n`),
    ).toBe(cert);
  });
  it("lee la salida V2 Signer de Android build-tools 37 observada en CI", () => {
    const output = `Verifies\nVerified using v2 scheme (APK Signature Scheme v2): true\nNumber of signers: 1\nV2 Signer: certificate DN: CN=Android Debug\nV2 Signer: certificate SHA-256 digest: ${cert}\nV2 Signer: public key SHA-256 digest: ${"a".repeat(64)}\n`;
    expect(readApkCertificate(output)).toBe(cert);
  });
  it("rechaza dos certificados distintos en el formato V2 Signer", () => {
    expect(() =>
      readApkCertificate(
        `V2 Signer: certificate SHA-256 digest: ${cert}\nV2 Signer: certificate SHA-256 digest: ${"a".repeat(64)}\n`,
      ),
    ).toThrow("distintas identidades");
  });
  it("lee intervalos SDK v3.1 con el mismo certificado sin aceptar rotación", () => {
    const output = `Signer (minSdkVersion=33, maxSdkVersion=2147483647) certificate SHA-256 digest: ${cert}\nSigner (minSdkVersion=24, maxSdkVersion=32) certificate SHA-256 digest: ${cert}\n`;
    expect(readApkCertificate(output)).toBe(cert);
  });
  it("normaliza mayúsculas y separadores sin cambiar la identidad", () => {
    const separated = cert.match(/.{2}/g).join(":").toUpperCase();
    expect(
      readApkCertificate(
        `Signer #1 certificate SHA-256 digest: ${separated}\r\n`,
      ),
    ).toBe(cert);
  });
  it("rechaza certificados distintos entre intervalos o firmantes", () => {
    expect(() =>
      readApkCertificate(
        `Signer #1 certificate SHA-256 digest: ${cert}\nSigner #2 certificate SHA-256 digest: ${"a".repeat(64)}\n`,
      ),
    ).toThrow("distintas identidades");
  });
  it("no ignora un segundo firmante con formato ilegible", () => {
    expect(() =>
      readApkCertificate(
        `Signer #1 certificate SHA-256 digest: ${cert}\nSigner #2 certificate SHA-256 digest: ilegible\n`,
      ),
    ).toThrow("Formato de certificado");
  });
  it("rechaza digests incompletos", () => {
    expect(() =>
      readApkCertificate("Signer #1 certificate SHA-256 digest: abc123\n"),
    ).toThrow("SHA-256 válido");
  });
  it("no sustituye el firmante por un sello de origen o la clave pública", () => {
    expect(() =>
      readApkCertificate(
        `Source Stamp Signer certificate SHA-256 digest: ${cert}\nSigner #1 public key SHA-256 digest: ${cert}\n`,
      ),
    ).toThrow("No se pudo leer");
  });
});
