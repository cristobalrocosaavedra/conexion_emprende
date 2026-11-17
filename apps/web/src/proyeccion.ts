// Proyección simple de Chile continental para dibujos esquemáticos (no cartografía).
export const chileBox = { west: -76, north: -17.3, k: 20, cos: 0.8 };
export const chileViewBox = "0 0 168 790";
export function project(lon: number, lat: number): [number, number] {
  return [
    Math.round((lon - chileBox.west) * chileBox.cos * chileBox.k * 10) / 10 + 4,
    Math.round((chileBox.north - lat) * chileBox.k * 10) / 10 + 4,
  ];
}
/** Rapa Nui no cabe en la franja: se ubica en un recuadro al costado. */
export function isIsland(lon: number) {
  return lon < -79;
}
