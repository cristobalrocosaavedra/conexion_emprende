#!/usr/bin/env python3
"""Descarga y prepara staging SERNATUR/MMA para Territorio Vivo. No publica ni toca DB."""
import argparse, csv, io, json, pathlib, re, unicodedata, urllib.request, zipfile
URL='https://lineasdebasepublicas.mma.gob.cl/datos_abiertos/dataset/7aa4b072-c938-4c45-a31e-9d57c41c2713/resource/3bd18aad-1add-483c-af7f-d90e49f1e6d2/download/atractivos-turisticos_geojson.zip'
FIELDS=['id_fuente','nombre','descripcion','administracion','demanda','region','provincia','comuna','latitud_referencia','longitud_referencia','tipo_geometria','fuente_url','estado','propiedades_originales_json']
def normalize(s):
 s=unicodedata.normalize('NFKD',str(s or ''));return ''.join(c for c in s if not unicodedata.combining(c)).lower().replace(' ','_').replace('-','_')
def lookup(props,terms):
 d={normalize(k):v for k,v in props.items()}
 for term in terms:
  if term in d and d[term] not in (None,''):return d[term]
 return ''
def extract_geojson(raw):
 if raw[:2]==b'PK':
  with zipfile.ZipFile(io.BytesIO(raw)) as z:
   members=[x for x in z.namelist() if x.lower().endswith(('.geojson','.json')) and not x.startswith('__MACOSX')]
   if not members:raise ValueError('ZIP sin GeoJSON. Revisar contenido manualmente.')
   return json.loads(z.read(members[0]).decode('utf-8-sig'))
 return json.loads(raw.decode('utf-8-sig'))
def collect_points(geom):
 if not geom:return []
 t=geom.get('type');coords=geom.get('coordinates')
 if t=='Point':return [coords]
 if t=='MultiPoint':return coords or []
 # No transformar arbitrariamente polígonos o rutas en una puerta de acceso
 return []
def main():
 p=argparse.ArgumentParser();p.add_argument('--archivo',help='ZIP/GeoJSON descargado manualmente');p.add_argument('--salida',default='staging_sernatur.csv');p.add_argument('--max-mb',type=int,default=60);a=p.parse_args()
 if a.archivo: raw=pathlib.Path(a.archivo).read_bytes()
 else:
  req=urllib.request.Request(URL,headers={'User-Agent':'TerritorioVivo-Importador/1.0 (datos publicos)'})
  with urllib.request.urlopen(req,timeout=60) as r:raw=r.read(a.max_mb*1024*1024+1)
 if len(raw)>a.max_mb*1024*1024:raise ValueError('Descarga supera limite permitido')
 geo=extract_geojson(raw)
 if geo.get('type')!='FeatureCollection':raise ValueError('No es FeatureCollection')
 rows=[]; types={}
 for i,f in enumerate(geo.get('features',[]),1):
  props=f.get('properties') or {};geom=f.get('geometry') or {};points=collect_points(geom)
  ty=geom.get('type') or '';types[ty]=types.get(ty,0)+1
  lon=lat=''
  if len(points)==1 and isinstance(points[0],list) and len(points[0])>=2:
   x,y=points[0][:2]
   if isinstance(x,(int,float)) and isinstance(y,(int,float)) and -180<=x<=180 and -90<=y<=90:lon,lat=x,y
  # Sin coordenada de acceso: solo punto geométrico de referencia cuando geometría Point
  row=[str(f.get('id') or lookup(props,['id','codigo','cod_atractivo']) or i),lookup(props,['nombre','nom_atractivo','atractivo','nombre_atractivo']),lookup(props,['descripcion','descrip','desc_atractivo']),lookup(props,['administracion','tipo_administracion','administra']),lookup(props,['demanda','tipo_demanda']),lookup(props,['region','nom_region']),lookup(props,['provincia','nom_provincia']),lookup(props,['comuna','nom_comuna']),lat,lon,ty,URL,'staging_no_publicar',json.dumps(props,ensure_ascii=False)]
  rows.append(row)
 with open(a.salida,'w',encoding='utf-8-sig',newline='') as out:
  w=csv.writer(out);w.writerow(FIELDS);w.writerows(rows)
 report={'registros':len(rows),'geometrias':types,'nombres_no_vacios':sum(bool(x[1]) for x in rows),'puntos_coordenadas':sum(x[8]!='' for x in rows),'atributos_muestra':list((geo.get('features') or [{}])[0].get('properties',{}).keys()),'advertencia':'No publicar automaticamente. Verificar nombres reales de atributos y coordenadas de acceso. No inferir gratuidad.'}
 pathlib.Path(a.salida+'.reporte.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
