#!/usr/bin/env bash
set -euo pipefail
umask 022
cd -- "$(dirname -- "$0")"
# Ejecutar en el VPS después de descargar y verificar el extracto público de Chile.
# Sin consultas de viajeros en este proceso. No descarga nada automáticamente.
source_file="${1:?Indica la ruta al extracto .osm.pbf verificado}"
[[ -f "$source_file" ]] || { echo 'No existe el extracto.' >&2; exit 1; }
[[ ! -e data/chile.osrm.properties ]] || { echo 'Ya existe un grafo. Preparar la renovación en otro directorio y cambiarla durante mantenimiento.' >&2; exit 1; }
mkdir -p data
cp -- "$source_file" data/chile.osm.pbf
image='ghcr.io/project-osrm/osrm-backend:v26.10.0-debian@sha256:55dbfd47d984c2cacd64e32901b4321c86b5ec761438e69aa053dc78698a786f'
for operation in extract partition customize; do
  if [[ "$operation" == extract ]]; then
    docker run --rm --user "$(id -u):$(id -g)" --network none --log-driver none --ulimit core=0 -v "$PWD/data:/data" "$image" osrm-extract --threads 3 -p /opt/car.lua /data/chile.osm.pbf
  else
    docker run --rm --user "$(id -u):$(id -g)" --network none --log-driver none --ulimit core=0 -v "$PWD/data:/data" "$image" "osrm-$operation" --threads 3 /data/chile.osrm
  fi
done
chmod -R a+rX data
printf '%s\n' 'Grafo preparado. Aún falta comprobar cobertura, HTTPS y ausencia de registros antes de conectar la app.'
