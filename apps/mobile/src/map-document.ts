import { buildTripMapDocument } from "./trip-map-document";
import {
  roadAreaForPlace,
  regionFeatures,
  regionBounds,
  serializeForHtml,
} from "@territorio-vivo/core";
import type { Place, RegionId } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { leafletCss, leafletJs } from "./vendor/leaflet";
export function buildMapDocument({
  region,
  points,
  trip = false,
  roundTrip = false,
  dark = false,
}: {
  region: RegionId;
  points: Place[];
  trip?: boolean;
  roundTrip?: boolean;
  dark?: boolean;
}): string {
  if (trip) return buildTripMapDocument(points, dark, roundTrip);
  const areas = [...new Set(points.map(roadAreaForPlace))];
  const focusArea = areas.length === 1 ? areas[0] : "mainland";
  const visiblePoints = points.filter((p) => roadAreaForPlace(p) === focusArea);
  const payload = serializeForHtml({
    features: regionFeatures,
    region,
    bounds: regionBounds(region),
    points: visiblePoints.map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.latitude,
      lng: p.longitude,
      category: p.category,
      status: t.verification[p.verification],
    })),
    trip,
    roundTrip,
    labels: {
      open: t.openPlace,
      zoomIn: t.zoomIn,
      zoomOut: t.zoomOut,
      limits: t.naturalEarthAttribution,
      osm: t.osmAttribution,
      mapOffline: t.mapOffline,
      pending: t.pending,
      mapSchematic: t.tripSchematic,
      follow: t.navigation.follow,
      road: t.navigation.road,
      routingAttribution: t.navigation.routingAttribution,
    },
  });
  return `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>${leafletCss}
 html,body,#map{height:100%;width:100%;margin:0;background:${dark ? "#2f2140" : "#efe9dd"}} .leaflet-popup-content{font:14px system-ui;line-height:1.5}.tv-pin{width:34px;height:34px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px #22162e66;display:flex;align-items:center;justify-content:center}.tv-pin svg{width:18px;height:18px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.tv-button{background:#22162e;color:#f7eedc;border:0;border-radius:8px;padding:10px 14px;min-height:44px;margin-top:8px;font-weight:600}.tv-note{position:absolute;bottom:30px;left:8px;z-index:900;max-width:75%;background:#f9f5e9ed;padding:7px;border-radius:8px;font:11px system-ui;color:#22162e} .leaflet-control-attribution{font-size:9px}
 </style></head><body><div id="map"></div><div id="note" class="tv-note" hidden></div><script>${leafletJs}</script><script>
 const data=${payload};
 const send=value=>{if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(value));else if(window.parent!==window)window.parent.postMessage(JSON.stringify(value),'*');};
 const map=L.map('map',{zoomControl:false,attributionControl:true}).setView([-32.4,-71.1],9);
 L.control.zoom({zoomInTitle:data.labels.zoomIn,zoomOutTitle:data.labels.zoomOut}).addTo(map);
 const base=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:data.labels.osm}).addTo(map);
 base.on('tileerror',()=>{const note=document.getElementById('note');note.hidden=false;note.textContent=data.labels.mapOffline;});
 L.geoJSON({type:'FeatureCollection',features:data.features},{interactive:false,style:f=>({color:f.properties.id===data.region?'#dd512d':'#5e5468',weight:1,fillColor:f.properties.id===data.region?'#f2aa19':'#5e5468',fillOpacity:f.properties.id===data.region ? 0.12 : 0.025})}).addTo(map);
 // Color y pictograma por categoría (manual 1.0); contraste del trazo ≥ 3:1.
 const CATEGORY={
  playa:{bg:'#08b9c9',ink:'#22162e',icon:'<path d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><path d="M2 20c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><circle cx="17" cy="6" r="3"/>'},
  naturaleza:{bg:'#159b60',ink:'#ffffff',icon:'<path d="M12 3 5 13h4l-3 5h12l-3-5h4z"/><path d="M12 18v3"/>'},
  cultura:{bg:'#dd512d',ink:'#ffffff',icon:'<path d="M3 10 12 4l9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 21h18"/>'},
  gastronomia:{bg:'#f2aa19',ink:'#22162e',icon:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 3c-2 2-2 6 0 8v10"/>'}
 };
 const positions=[];
 data.points.forEach((p,i)=>{
  if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng))return;
  positions.push([p.lat,p.lng]);
  const look=CATEGORY[p.category]||CATEGORY.cultura;
  const pin='<div class="tv-pin" style="background:'+look.bg+'"><svg viewBox="0 0 24 24" stroke="'+look.ink+'">'+look.icon+'</svg></div>';
  const marker=L.marker([p.lat,p.lng],{title:p.name,alt:p.name,icon:L.divIcon({className:'',html:pin,iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-16]})}).addTo(map);
  const popup=document.createElement('div');const title=document.createElement('strong');title.textContent=(data.trip?(i+1)+'. ':'')+p.name;popup.appendChild(title);
  const note=document.createElement('div');note.textContent=p.status||data.labels.pending;popup.appendChild(note);
  const button=document.createElement('button');button.className='tv-button';button.textContent=data.labels.open;button.onclick=()=>send({type:'place',id:p.id});popup.appendChild(button);marker.bindPopup(popup);
 });
 let schematic=null;
 if(data.trip&&positions.length>1){const line=data.roundTrip?[...positions,positions[0]]:positions;schematic=L.polyline(line,{color:'#b95930',weight:4,dashArray:'7 8'}).addTo(map);const note=document.getElementById('note');note.hidden=false;note.textContent=data.labels.mapSchematic;}
 if(positions.length>1)map.fitBounds(L.latLngBounds(positions),{padding:[30,30],maxZoom:13});else if(positions.length===1)map.setView(positions[0],13);else map.fitBounds([[data.bounds[0][1],data.bounds[0][0]],[data.bounds[1][1],data.bounds[1][0]]],{padding:[12,12]});
 map.attributionControl.addAttribution(data.labels.limits);

 let road=null,gps=null,accuracy=null,follow=true,routeSignature='',latestFix=null,latestFollow=false;
 map.on('dragstart',()=>{follow=false;});
 const followControl=L.control({position:'topright'});
 followControl.onAdd=()=>{const b=L.DomUtil.create('button','tv-button');b.textContent=data.labels.follow;L.DomEvent.disableClickPropagation(b);b.onclick=()=>{follow=true;if(latestFix)map.setView([latestFix.latitude,latestFix.longitude],16);};return b;};
 let followShown=false;
 const showFollow=on=>{if(on&&!followShown)followControl.addTo(map);else if(!on&&followShown)followControl.remove();followShown=on;};
 window.tvNavigation=value=>{
  if(!value){showFollow(false);latestFix=null;latestFollow=false;follow=true;map.attributionControl.removeAttribution(data.labels.routingAttribution);if(road)map.removeLayer(road);if(gps)map.removeLayer(gps);if(accuracy)map.removeLayer(accuracy);road=gps=accuracy=null;routeSignature='';if(schematic&&!map.hasLayer(schematic))schematic.addTo(map);return;}
  const r=value.route,p=value.fix;
  if(value.publicService&&r)map.attributionControl.addAttribution(data.labels.routingAttribution);
  showFollow(Boolean(value.follow));
  if(value.follow&&!latestFollow)follow=true;latestFollow=value.follow;
  if(r&&Array.isArray(r.points)){
   if(schematic&&map.hasLayer(schematic))map.removeLayer(schematic);
   const coordinates=r.points.map(p=>[p.latitude,p.longitude]);
   const signature=JSON.stringify(coordinates);
   if(signature!==routeSignature){routeSignature=signature;if(road)map.removeLayer(road);road=L.polyline(coordinates,{color:'#168b82',weight:6,opacity:0.95}).addTo(map);map.fitBounds(road.getBounds(),{padding:[30,30],maxZoom:16});}
   const note=document.getElementById('note');note.hidden=false;note.textContent=data.labels.road;
  }else if(Object.prototype.hasOwnProperty.call(value,'route')&&road){map.attributionControl.removeAttribution(data.labels.routingAttribution);map.removeLayer(road);road=null;routeSignature='';if(schematic)schematic.addTo(map);const note=document.getElementById('note');note.textContent=data.labels.mapSchematic;}
  if(p&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)){
   latestFix=p;const xy=[p.latitude,p.longitude];
   if(!gps)gps=L.circleMarker(xy,{radius:8,color:'#fff',weight:3,fillColor:'#2274df',fillOpacity:1}).addTo(map);else gps.setLatLng(xy);
   if(accuracy)map.removeLayer(accuracy);if(Number.isFinite(p.accuracy)&&p.accuracy>=0)accuracy=L.circle(xy,{radius:Math.min(p.accuracy,1000),weight:1,color:'#2274df',fillOpacity:0.08}).addTo(map);
   if(value.follow&&follow)map.setView(xy,Math.max(map.getZoom(),15),{animate:false});
  }else{latestFix=null;if(gps)map.removeLayer(gps);if(accuracy)map.removeLayer(accuracy);gps=accuracy=null;}
 };
 window.addEventListener('message',event=>{if(event.source!==window.parent)return;const m=event.data;if(m&&m.type==='tv-navigation')window.tvNavigation(m.value);});
 window.addEventListener('resize',()=>map.invalidateSize());
 </script></body></html>`;
}
