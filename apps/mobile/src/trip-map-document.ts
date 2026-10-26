import { schematicSegments, serializeForHtml } from "@territorio-vivo/core";
import type { Place } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { maplibreJs, maplibreCss, maplibreLicense } from "./vendor/maplibre";
export function buildTripMapDocument(
  points: Place[],
  dark: boolean,
  roundTrip: boolean,
): string {
  const data = serializeForHtml({
    points: points
      .filter((p) => p.latitude !== null && p.longitude !== null)
      .map((p) => ({ id: p.id, name: p.name, xy: [p.longitude, p.latitude] })),
    segments: schematicSegments(points, roundTrip).map((group) =>
      group
        .filter((p) => p.latitude !== null && p.longitude !== null)
        .map((p) => [p.longitude, p.latitude]),
    ),
    roundTrip,
    labels: {
      follow: t.navigation.follow,
      north: t.navigation.northUp,
      course: t.navigation.courseUp,
      all: t.navigation.entireRoute,
      offline: t.mapOffline,
      schematic: t.tripSchematic,
      road: t.navigation.road,
      unsupported: t.navigation.mapUnsupported,
      open: t.openPlace,
      zoomIn: t.zoomIn,
      zoomOut: t.zoomOut,
    },
  });
  return `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>${maplibreCss}
 html,body,#map{height:100%;width:100%;margin:0;background:${dark ? "#102d42" : "#ddebe6"}}#controls{position:absolute;left:8px;top:8px;display:flex;flex-wrap:wrap;gap:6px;max-width:75%}button{font:600 13px system-ui;min-height:44px;border:1px solid #9ab5bd;border-radius:10px;background:#fff;color:#123247;padding:8px}#note{position:absolute;bottom:28px;left:8px;max-width:80%;background:#fffdeb;color:#123247;padding:6px;border-radius:8px;font:11px system-ui;pointer-events:none}.maplibregl-popup{font:14px system-ui;color:#123247}</style></head><body><script type="application/json" id="licenses">${serializeForHtml(maplibreLicense)}</script><div id="map"></div><div id="controls"></div><div id="note"></div><script>${maplibreJs}</script><script>
 const data=${data};const note=document.getElementById('note');
 const send=value=>{if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(value));else window.parent.postMessage(JSON.stringify(value),'*');};
 try{
 const map=new maplibregl.Map({container:'map',maxPitch:0,maxZoom:20,style:{version:8,sources:{osm:{type:'raster',maxzoom:19,tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}},layers:[{id:'background',type:'background',paint:{'background-color':'${dark ? "#102d42" : "#ddebe6"}'}},{id:'osm',type:'raster',source:'osm'}]},center:data.points[0]?.xy||[-71.2,-32.45],zoom:10,attributionControl:{compact:true},locale:{'NavigationControl.ZoomIn':data.labels.zoomIn,'NavigationControl.ZoomOut':data.labels.zoomOut,'NavigationControl.ResetBearing':data.labels.north}});
 window.tvMap=map;
 map.addControl(new maplibregl.NavigationControl(),'top-right');
 let offline=false,ready=false,pending=null,line=null,fix=null,follow=true,active=false,course=true,lastHeading=0,hadActive=false;
 const control=(label,action)=>{const b=document.createElement('button');b.textContent=label;b.onclick=action;document.getElementById('controls').appendChild(b);return b;};
 const fit=()=>{const xy=line?.points?.map(p=>[p.longitude,p.latitude])||data.points.map(p=>p.xy);if(!xy.length)return;const bounds=xy.reduce((b,p)=>b.extend(p),new maplibregl.LngLatBounds(xy[0],xy[0]));map.fitBounds(bounds,{padding:45,maxZoom:16,duration:0,bearing:0});};
 const center=()=>{if(!fix)return;map.easeTo({center:[fix.longitude,fix.latitude],bearing:course?lastHeading:0,duration:0,offset:[0,map.getContainer().clientHeight*0.15]});};
 control(data.labels.follow,()=>{follow=true;center();});
 const bearingButton=control(data.labels.course,()=>{course=!course;bearingButton.textContent=course?data.labels.course:data.labels.north;map.easeTo({bearing:course?lastHeading:0,duration:0});});
 control(data.labels.all,()=>{follow=false;fit();});
 for(const event of ['dragstart','zoomstart','rotatestart','pitchstart'])map.on(event,e=>{if(e.originalEvent)follow=false;});
 const geo=xy=>({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:xy.length>1?xy:[]}});
 const paintLine=()=>{const geometry=line?geo(line.points.map(p=>[p.longitude,p.latitude])):{type:'FeatureCollection',features:data.segments.map(geo)};map.getSource('road').setData(geometry);map.setPaintProperty('road-line','line-dasharray',line?[1,0]:[2,2]);note.textContent=(line?data.labels.road:data.labels.schematic)+(offline?" · "+data.labels.offline:"");};
 const apply=value=>{
 if(!value){fix=null;line=null;active=false;hadActive=false;map.getSource('position').setData({type:'FeatureCollection',features:[]});paintLine();return;}
 active=Boolean(value.follow);
 if(Object.prototype.hasOwnProperty.call(value,'route')){line=value.route;paintLine();if(line&&!active)fit();}
 fix=value.fix;
 if(fix&&Number.isFinite(fix.latitude)&&Number.isFinite(fix.longitude)){
  if(Number.isFinite(fix.heading)&&fix.heading>=0&&fix.heading<360)lastHeading=fix.heading;
  map.getSource('position').setData({type:'Feature',geometry:{type:'Point',coordinates:[fix.longitude,fix.latitude]},properties:{}});
  if(active&&!hadActive){follow=true;map.setZoom(15);}
  if(active&&follow)center();
 }else map.getSource('position').setData({type:'FeatureCollection',features:[]});
 hadActive=active;
 };
 window.tvNavigation=value=>{if(!ready){pending=value===null?null:{...pending,...value};return;}apply(value);};
 window.addEventListener('message',e=>{if(e.source===window.parent&&e.data?.type==='tv-navigation')window.tvNavigation(e.data.value);});
 map.once('style.load',()=>{
 map.addSource('road',{type:'geojson',data:geo([])});map.addLayer({id:'road-line',type:'line',source:'road',paint:{'line-color':'#168b82','line-width':5}});
 map.addSource('position',{type:'geojson',data:{type:'FeatureCollection',features:[]}});map.addLayer({id:'position-point',type:'circle',source:'position',paint:{'circle-color':'#2274df','circle-radius':8,'circle-stroke-width':3,'circle-stroke-color':'#ffffff'}});
 for(const [i,p]of data.points.entries()){
 const content=document.createElement('div');const title=document.createElement('strong');title.textContent=(i+1)+'. '+p.name;content.appendChild(title);const button=document.createElement('button');button.textContent=data.labels.open;button.onclick=()=>send({type:'place',id:p.id});content.appendChild(button);
 new maplibregl.Marker({color:'#b95930'}).setLngLat(p.xy).setPopup(new maplibregl.Popup().setDOMContent(content)).addTo(map);
 }
 map.addControl(new maplibregl.AttributionControl({customAttribution:'<a href="https://routing.openstreetmap.de/about.html">Rutas FOSSGIS / OSRM</a>',compact:true}),'bottom-left');
 ready=true;paintLine();fit();if(pending)apply(pending);
 });
 map.on('error',e=>{if(e.sourceId==='osm'){offline=true;note.textContent=(line?data.labels.road+' · ':'')+data.labels.offline;}});
 window.addEventListener('resize',()=>map.resize());
 }catch{note.textContent=data.labels.unsupported;}
 </script></body></html>`;
}
