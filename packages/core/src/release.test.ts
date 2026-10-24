import { afterEach, describe, expect, it } from "vitest";
import {
  mkdtempSync,
  writeFileSync,
  mkdirSync,
  readFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const directories: string[] = [];
afterEach(() => {
  for (const dir of directories.splice(0))
    rmSync(dir, { recursive: true, force: true });
});
function fixture(mode = "first", ref = "refs/heads/develop") {
  const dir = mkdtempSync(join(tmpdir(), "tv-release-test-"));
  directories.push(dir);
  mkdirSync(join(dir, "bin"));
  mkdirSync(join(dir, "artefactos"));
  mkdirSync(join(dir, "apps/mobile"), { recursive: true });
  const identity = JSON.parse(
    readFileSync(join(root, "apps/mobile/app-identity.json"), "utf8"),
  );
  writeFileSync(
    join(dir, "apps/mobile/app-identity.json"),
    JSON.stringify(identity),
  );
  const bytes = Buffer.from("APK de prueba del publicador, no instalable");
  writeFileSync(join(dir, "artefactos/territorio-vivo-android.apk"), bytes);
  const meta = {
    version: "0.2.0",
    versionCode: 100200,
    packageName: identity.androidPackage,
    certificateSha256: identity.testCertificateSha256,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    commit: "fixture",
  };
  writeFileSync(join(dir, "artefactos/version.json"), JSON.stringify(meta));
  const stub = `#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const args=process.argv.slice(2);const mode=process.env.TEST_RELEASE_MODE;fs.appendFileSync('calls.jsonl',JSON.stringify(args)+'\\n');
if(args[0]==='api'&&args[1].endsWith('/releases/latest')){if(mode==='older'){console.log(JSON.stringify({tag_name:'previous'}));process.exit(0);}console.error('HTTP 404');process.exit(1);}
if(args[0]==='release'&&args[1]==='download'){const dir=args[args.indexOf('--dir')+1];fs.writeFileSync(path.join(dir,'version.json'),JSON.stringify({versionCode:100300}));process.exit(0);}
if(args[0]==='api'&&args[1].endsWith('releases?per_page=100')){console.log('[]');process.exit(0);}
if(args[0]==='api'&&args.includes('POST')){const file=args[args.indexOf('--input')+1];const body=JSON.parse(fs.readFileSync(file));if(!body.draft)process.exit(9);console.log(JSON.stringify({id:42,draft:true}));process.exit(0);}
if(args[0]==='release'&&args[1]==='upload'){if(mode==='upload-fails')process.exit(7);process.exit(0);}
if(args[0]==='api'&&args.includes('PATCH')){console.log('{}');process.exit(0);}
console.error('Solicitud inesperada');process.exit(10);
`;
  writeFileSync(join(dir, "bin/gh"), stub, { mode: 0o755 });
  for (const name of [
    "pantalla-inicio.png",
    "pantalla-explorar.png",
    "pantalla-ficha.png",
  ])
    writeFileSync(
      join(dir, "artefactos", name),
      Buffer.from("89504e470d0a1a0a", "hex"),
    );
  const run = () =>
    spawnSync(
      process.execPath,
      [resolve(root, "scripts/publish-android.mjs")],
      {
        cwd: dir,
        env: {
          ...process.env,
          PATH: join(dir, "bin") + ":" + process.env.PATH,
          TMPDIR: dir,
          GITHUB_EVENT_NAME: "push",
          GITHUB_REF: ref,
          GITHUB_REPOSITORY: "example/fixture",
          TEST_RELEASE_MODE: mode,
        },
        encoding: "utf8",
      },
    );
  const calls = () =>
    existsSync(join(dir, "calls.jsonl"))
      ? readFileSync(join(dir, "calls.jsonl"), "utf8")
          .trim()
          .split("\n")
          .map((s) => JSON.parse(s) as string[])
      : [];
  return { dir, run, calls };
}
describe("canal de APK sin publicar en servicios reales", () => {
  it("publica solo después de subir activos a una versión en borrador", () => {
    const f = fixture();
    const result = f.run();
    expect(result.status, result.stderr).toBe(0);
    const calls = f.calls();
    const create = calls.findIndex((c) => c.includes("POST")),
      upload = calls.findIndex((c) => c[0] === "release" && c[1] === "upload"),
      publish = calls.findIndex((c) => c.includes("PATCH"));
    expect(create).toBeGreaterThanOrEqual(0);
    expect(upload).toBeGreaterThan(create);
    expect(publish).toBeGreaterThan(upload);
  });
  it("un build anterior no reemplaza una versión más nueva", () => {
    const f = fixture("older");
    const result = f.run();
    expect(result.status, result.stderr).toBe(0);
    expect(
      f
        .calls()
        .some(
          (c) =>
            c.includes("POST") || c.includes("PATCH") || c.includes("upload"),
        ),
    ).toBe(false);
  });
  it("un PR no inicia ninguna publicación", () => {
    const f = fixture("first", "refs/pull/3/merge");
    const result = f.run();
    expect(result.status).not.toBe(0);
    expect(f.calls()).toEqual([]);
  });
  it("si la subida falla deja la versión como borrador y conserva el canal", () => {
    const f = fixture("upload-fails");
    expect(f.run().status).not.toBe(0);
    expect(f.calls().some((c) => c.includes("PATCH"))).toBe(false);
  });
  it("rechaza un APK que no coincide con su checksum antes de contactar GitHub", () => {
    const f = fixture();
    writeFileSync(
      join(f.dir, "artefactos/territorio-vivo-android.apk"),
      "alterado",
    );
    expect(f.run().status).not.toBe(0);
    expect(f.calls()).toEqual([]);
  });
});
