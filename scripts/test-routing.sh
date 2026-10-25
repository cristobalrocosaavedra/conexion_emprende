#!/usr/bin/env bash
set -euo pipefail
# Linux Docker local. Solo calles públicas de prueba; no conecta ni compra un VPS.
cd -- "$(dirname -- "$0")/.."
root="$PWD"
scratch="$(mktemp -d "${TMPDIR:-/tmp}/tv-routing.XXXXXX")"
project="tv-routing-test-$$"
docker_cmd=(env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock)
compose=("${docker_cmd[@]}" compose -p "$project" -f "$scratch/compose.yml" -f "$scratch/local.yml")
export ROUTING_HOST=rutas.ejemplo.cl
cleanup(){ "${compose[@]}" down --volumes >/dev/null 2>&1 || true; rm -rf -- "$scratch"; }
trap cleanup EXIT
chmod 755 "$scratch"
cp infra/routing/compose.yml infra/routing/nginx.conf infra/routing/Caddyfile "$scratch/"
chmod 644 "$scratch/"*.conf "$scratch/Caddyfile"
mkdir "$scratch/data"
chmod 755 "$scratch/data"
cp tests/routing/fixtures/arica.osm "$scratch/data/chile.osm"
cat > "$scratch/local.yml" <<'YAML'
services:
  gateway:
    ports: ['127.0.0.1::8080']
YAML
image='ghcr.io/project-osrm/osrm-backend:v26.10.0-debian@sha256:55dbfd47d984c2cacd64e32901b4321c86b5ec761438e69aa053dc78698a786f'
"${compose[@]}" config --quiet
for operation in extract partition customize; do
 if [[ "$operation" == extract ]]; then
  args=(osrm-extract --threads 2 -p /opt/car.lua /data/chile.osm)
 else
  args=("osrm-$operation" --threads 2 /data/chile.osrm)
 fi
 "${docker_cmd[@]}" run --rm --user "$(id -u):$(id -g)" --network none --log-driver none --ulimit core=0 -v "$scratch/data:/data" "$image" "${args[@]}" >"$scratch/$operation.txt" 2>&1
done
chmod -R a+rX "$scratch/data"
"${compose[@]}" up -d osrm gateway
endpoint="http://$("${compose[@]}" port gateway 8080)"
python3 - "$endpoint" <<'PY'
import json,time,sys,urllib.request,urllib.error
base=sys.argv[1]
for attempt in range(30):
 try:
  with urllib.request.urlopen(base+'/healthz',timeout=2) as r: assert json.load(r)['code']=='Ok'
  break
 except (OSError,ValueError,AssertionError):
  if attempt==29: raise
  time.sleep(0.2)
with urllib.request.urlopen(base+'/capabilities') as r:
 assert r.headers['Cache-Control']=='no-store'
 caps=json.load(r);assert caps['coordinateLogs'] is False and caps['maxWaypoints']==40
with urllib.request.urlopen(base+'/route/v1/driving/-70.3129,-18.4783;-70.310,-18.475?steps=true&geometries=geojson&overview=full') as r:
 v=json.load(r);assert v['code']=='Ok';route=v['routes'][0]
 assert len(route['geometry']['coordinates'])>10 and len(route['legs'][0]['steps'])>2 and route['distance']>100
try: urllib.request.urlopen(base+'/route/v1/driving/0,0;1,1')
except urllib.error.HTTPError as e: assert e.code==400 and json.load(e)['code']=='NoSegment'
else: raise AssertionError('No se rechazó una posición fuera de cobertura')
for method,path,expected in [('GET','/table/v1/driving/0,0;1,1',404),('POST','/capabilities',405)]:
 try: urllib.request.urlopen(urllib.request.Request(base+path,method=method))
 except urllib.error.HTTPError as e: assert e.code==expected
 else: raise AssertionError('Se abrió un método/servicio no permitido')
print('Motor real: geometría, pasos, salud, sin caché, cobertura y bloqueo de otros servicios: correctos.')
PY
for service in osrm gateway; do
 container="$("${compose[@]}" ps -q "$service")"
 "${docker_cmd[@]}" inspect "$container" --format '{{json .HostConfig.LogConfig}} {{json .HostConfig.Ulimits}}' | python3 -c 'import sys,json; line=sys.stdin.read(); a,b=line.split("} ",1); assert json.loads(a+"}")["Type"]=="none"; assert any(u["Name"]=="core" and u["Hard"]==0 for u in json.loads(b)); print("Registros de contenedor y volcados de memoria desactivados.")'
done
"${docker_cmd[@]}" run --rm --network none --log-driver none --ulimit core=0 -e ROUTING_HOST=rutas.ejemplo.cl -v "$scratch/Caddyfile:/etc/caddy/Caddyfile:ro" caddy:2.10.2-alpine@sha256:4c6e91c6ed0e2fa03efd5b44747b625fec79bc9cd06ac5235a779726618e530d caddy validate --config /etc/caddy/Caddyfile >/dev/null
printf '%s\n' 'Configuración HTTPS válida. Certificado público y cobertura nacional pendientes del VPS real.'
