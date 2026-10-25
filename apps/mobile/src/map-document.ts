import {
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
  const payload = serializeForHtml({
    features: regionFeatures,
    region,
    bounds: regionBounds(region),
    points: points.map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.latitude,
      lng: p.longitude,
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
    },
  });
  return `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>${leafletCss}
 html,body,#map{height:100%;width:100%;margin:0;background:${dark ? "#102d42" : "#ddebe6"}} .leaflet-popup-content{font:14px system-ui;line-height:1.5}.tv-button{background:#086f69;color:white;border:0;border-radius:8px;padding:10px 14px;min-height:44px;margin-top:8px;font-weight:600}.tv-note{position:absolute;bottom:30px;left:8px;z-index:900;max-width:75%;background:#f9f5e9ed;padding:7px;border-radius:8px;font:11px system-ui;color:#123247} .leaflet-control-attribution{font-size:9px}
 </style></head><body><div id="map"></div><div id="note" class="tv-note" hidden></div><script>${leafletJs}</script><script>
 const data=${payload};
 const send=value=>{if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(value));else if(window.parent!==window)window.parent.postMessage(JSON.stringify(value),'*');};
 const map=L.map('map',{zoomControl:false,attributionControl:true}).setView([-32.4,-71.1],9);
 L.control.zoom({zoomInTitle:data.labels.zoomIn,zoomOutTitle:data.labels.zoomOut}).addTo(map);
 const base=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:data.labels.osm}).addTo(map);
 base.on('tileerror',()=>{const note=document.getElementById('note');note.hidden=false;note.textContent=data.labels.mapOffline;});
 L.geoJSON({type:'FeatureCollection',features:data.features},{interactive:false,style:f=>({color:f.properties.id===data.region?'#c57839':'#327d88',weight:1,fillColor:f.properties.id===data.region?'#eebd73':'#3bb6ad',fillOpacity:f.properties.id===data.region ? 0.12 : 0.025})}).addTo(map);
 const positions=[];
 data.points.forEach((p,i)=>{
  if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng))return;
  positions.push([p.lat,p.lng]);
  const marker=L.circleMarker([p.lat,p.lng],{radius:8,color:'#fff',weight:2,fillColor:data.trip?'#b95930':'#087e7c',fillOpacity:1}).addTo(map);
  const popup=document.createElement('div');const title=document.createElement('strong');title.textContent=(data.trip?(i+1)+'. ':'')+p.name;popup.appendChild(title);
  const note=document.createElement('div');note.textContent=data.labels.pending;popup.appendChild(note);
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
 followControl.addTo(map);
 window.tvNavigation=value=>{
  if(!value){if(road)map.removeLayer(road);if(gps)map.removeLayer(gps);if(accuracy)map.removeLayer(accuracy);road=gps=accuracy=null;routeSignature='';if(schematic&&!map.hasLayer(schematic))schematic.addTo(map);return;}
  const r=value.route,p=value.fix;
  if(value.follow&&!latestFollow)follow=true;latestFollow=value.follow;
  if(r&&Array.isArray(r.points)){
   if(schematic&&map.hasLayer(schematic))map.removeLayer(schematic);
   const coordinates=r.points.map(p=>[p.latitude,p.longitude]);
   const signature=JSON.stringify(coordinates);
   if(signature!==routeSignature){routeSignature=signature;if(road)map.removeLayer(road);road=L.polyline(coordinates,{color:'#168b82',weight:6,opacity:0.95}).addTo(map);map.fitBounds(road.getBounds(),{padding:[30,30],maxZoom:16});}
   const note=document.getElementById('note');note.hidden=false;note.textContent=data.labels.road;
  }else if(road){map.removeLayer(road);road=null;routeSignature='';if(schematic)schematic.addTo(map);}
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
