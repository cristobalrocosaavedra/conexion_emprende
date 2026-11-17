// Textos del sitio web de Turismo en tu Mano (español primero).
const plural = (n: number, one: string, many: string) =>
  `${n.toLocaleString("es-CL")} ${n === 1 ? one : many}`;

export const sitio = {
  nav: {
    home: "Inicio",
    destinations: "Destinos",
    panoramas: "Panoramas",
    business: "Negocios locales",
    route: "Mi ruta",
    favorites: "Favoritos",
    join: "Suma tu negocio",
    search: "Buscar",
    main: "Navegación principal",
    mobile: "Navegación rápida",
  },
  skip: "Saltar al contenido",
  youAreIn: "Estás en…",
  chooseRegion: "Elige tu región",
  chooseRegionHint: "De norte a sur. Puedes cambiarla cuando quieras.",
  close: "Cerrar",
  searchLabel: "Buscar comuna, región o lugar",
  searchPlaceholder: "¿A dónde vas? Comuna, región o lugar",
  searchEmpty: "Sin resultados con ese nombre.",
  searchLoading: "Cargando buscador…",
  searchKinds: {
    region: "Región",
    province: "Provincia",
    commune: "Comuna",
    place: "Lugar",
  },
  useLocation: "Usar mi ubicación",
  locating: "Buscando tu región…",
  locationDenied:
    "No tenemos permiso de ubicación. Elige tu región en el selector.",
  locationFailed: "No pudimos identificar tu región. Elígela en el selector.",
  locationNote: "Solo para encontrar tu región. No guardamos coordenadas.",
  heroTitle: "Chile, en la palma de tu mano",
  heroSubtitle: "Turismo y comercio local de Arica a Magallanes",
  yourRegion: "Tu región",
  zonesTitle: "Recorre Chile de norte a sur",
  zones: { norte: "Norte", centro: "Centro", sur: "Sur", austral: "Austral" },
  regionCount: (n: number) => plural(n, "región", "regiones"),
  inYourRegion: (region: string) => `En ${region}`,
  inYourRegionHint:
    "Elige tu región o usa tu ubicación para ver qué hacer cerca.",
  seeRegion: "Ver la región",
  founders: "Negocios fundadores",
  foundersHint:
    "Los primeros negocios que se suman, uno o dos por región. Cada ficha se revisa antes de publicarse.",
  joinBanner: "¿Tienes un negocio turístico? Aparece en tu comuna.",
  seePlans: "Ver planes",
  illustration: "Ilustración",
  illustrationNote:
    "Ilustración de referencia de la zona; no es una fotografía del lugar.",
  regionTitle: (name: string, id: string) =>
    id === "metropolitana" ? `Región ${name}` : `Región de ${name}`,
  provinceTitle: (name: string) => `Provincia de ${name}`,
  provinces: "Provincias",
  communes: "Comunas",
  communesCount: (n: number) => plural(n, "comuna", "comunas"),
  placesCount: (n: number) => plural(n, "lugar", "lugares"),
  stops: (n: number) => plural(n, "parada", "paradas"),
  tabs: { todo: "Qué hacer", explore: "Explorar", business: "Negocios" },
  tabsLabel: "Secciones del territorio",
  panoramas: "Panoramas",
  panoramasHint:
    "Lugares para recorrer, ordenados por tipo. Súmalos a Mi ruta y arma tu día.",
  dayRoutes: "Rutas de un día",
  dayRoutesHint:
    "Recorridos sugeridos con paradas del catálogo. Los tiempos se calculan al iniciar la ruta.",
  addAllToRoute: "+ Agregar todo a Mi ruta",
  allAdded: "✓ Todo en Mi ruta",
  emptyTodo:
    "Aún no hay lugares publicados aquí. Estamos sumando fuentes oficiales y negocios locales.",
  showMore: (n: number) => `Ver ${plural(n, "lugar más", "lugares más")}`,
  businessHint:
    "Gastronomía y comercio local. Los espacios destacados pagados siempre van rotulados.",
  businessEmpty: "Todavía no hay negocios publicados aquí.",
  businessCta: "¿Tu negocio está aquí? Súmalo",
  mapHint: "Toca un ícono para ver la ficha o sumarlo a Mi ruta.",
  mapLoading: "Cargando mapa…",
  mapLabel: (name: string) => `Mapa de ${name}`,
  mapFilters: "Filtrar por tipo",
  noCoordinates: (n: number) =>
    `${plural(n, "lugar", "lugares")} sin ubicación confirmada en el mapa:`,
  seeCard: "Ver ficha",
  addToRoute: "+ Mi ruta",
  inRoute: "✓ En Mi ruta",
  favorite: "♡ Guardar",
  favorited: "♥ Guardado",
  northTo: (name: string) => `↑ Norte: ${name}`,
  southTo: (name: string) => `Sur: ${name} ↓`,
  countryStart: "Comienza Chile",
  countryEnd: "Fin del continente",
  regionPager: "Regiones vecinas",
  rapaNuiTitle: "Rapa Nui · traslado aéreo",
  rapaNuiBody:
    "Isla de Pascua es parte de la Región de Valparaíso. Se llega en avión: no hay camino desde el continente.",
  seeCommune: "Ver comuna",
  verifiedCount: (n: number) => plural(n, "con fuente", "con fuente"),
  howToGet: "Cómo llegar",
  walk: "A pie",
  car: "En auto",
  howToGetNote:
    "Abre el mapa de rutas de Turismo en tu Mano. Las rutas usan un servicio público de pruebas que registra las consultas.",
  noCoords: "Ubicación por confirmar: todavía no podemos calcular cómo llegar.",
  notOnMap:
    "Este negocio todavía no aparece en el mapa ni en las rutas. Puedes ver sus datos aquí.",
  notOnMapOwner:
    "¿Es tu negocio? Con el plan Completo aparece en el mapa y en las rutas",
  featured: "Destacado",
  featuredNote: "Espacio destacado pagado por el negocio",
  nearby: "Cerca de aquí",
  km: (n: number) =>
    n < 1
      ? `${Math.round(n * 1000)} m`
      : `${n.toLocaleString("es-CL", { maximumFractionDigits: 1 })} km`,
  sourceTitle: "Fuente y verificación",
  sourceLink: "Ver fuente",
  sourceNone: "Sin fuente publicada todavía.",
  osmNote: "Dato de OpenStreetMap, © colaboradores, licencia ODbL.",
  reportError: "¿Ves un error? Avísanos",
  about: "Sobre este lugar",
  aboutEmpty:
    "Aún no tenemos una descripción revisada. Si conoces este lugar, ayúdanos a completarla.",
  share: "Compartir",
  copied: "Enlace copiado",
  routeTitle: "Mi ruta",
  routeSummary: (regions: number, stops: number) =>
    `Tu viaje · ${plural(regions, "región", "regiones")} · ${plural(stops, "parada", "paradas")}`,
  routeEmpty:
    "Tu ruta está vacía. Agrega lugares desde cualquier región con «+ Mi ruta».",
  startRoute: "Iniciar ruta",
  startRouteNote:
    "Abre el mapa con rutas a pie o en auto entre tus paradas, con tu permiso de ubicación.",
  flight: "Traslado aéreo",
  flightNote: "Entre el continente y Rapa Nui se viaja en avión.",
  stored: "Se guarda solo en tu navegador, sin coordenadas.",
  clearRoute: "Vaciar ruta",
  moveUp: "Subir",
  moveDown: "Bajar",
  remove: "Quitar",
  routeMapNote:
    "Mapa esquemático: muestra el orden de las paradas, no el camino.",
  favoritesTitle: "Favoritos",
  favoritesEmpty: "Aún no guardas lugares. Usa «♡ Guardar» en cualquier ficha.",
  favoritesStored: "Se guardan solo en tu navegador.",
  destinationsTitle: "Destinos",
  destinationsHint:
    "Las 16 regiones de Chile, de norte a sur, con sus provincias y comunas.",
  panoramasTitle: "Panoramas en Chile",
  panoramasNationalHint:
    "Elige una zona y una región para ver qué hacer. Cada región tiene sus panoramas y rutas de un día.",
  businessTitle: "Negocios locales",
  businessNationalHint:
    "Gastronomía y comercio local publicado en el catálogo, por región.",
  sourcesTitle: "Fuentes y verificación",
  sourcesIntro:
    "Cada lugar muestra de dónde viene su información y qué tan revisada está.",
  seals: [
    {
      title: "✓ Verificado",
      body: "Revisamos el dato con evidencia documentada, por ejemplo la confirmación del titular del negocio.",
    },
    {
      title: "Fuente oficial",
      body: "La información viene de un organismo público identificado, como un ministerio, un municipio o un servicio del Estado.",
    },
    {
      title: "Pendiente de verificación",
      body: "Dato de referencia que todavía no revisamos. Confírmalo antes de viajar.",
    },
    {
      title: "Destacado",
      body: "Espacio pagado por un negocio. Siempre va rotulado y no cambia su estado de verificación.",
    },
  ],
  osmTitle: "Datos de OpenStreetMap",
  osmBody:
    "Parte del catálogo y el mapa usan datos de OpenStreetMap, © colaboradores de OpenStreetMap, disponibles bajo la licencia Open Database License (ODbL) 1.0. Esos datos se mantienen separados y con su atribución.",
  illustrationsTitle: "Ilustraciones",
  illustrationsBody:
    "Las portadas regionales son ilustraciones generadas e inspiradas en cada zona. No son fotografías de los lugares ni de los negocios.",
  footerTeam: "Equipo Turismo en tu Mano",
  footerTest: "Sitio en pruebas · catálogo de referencia",
  footerOsm: "Mapas © colaboradores de OpenStreetMap · ODbL",
  footerSources: "Fuentes y verificación",
  footerMunicipal: "Municipios",
  notFoundTitle: "No encontramos esta página",
  notFoundBody:
    "Puede que la dirección haya cambiado. Vuelve al inicio o busca un destino.",
  backHome: "Volver al inicio",
  pageTitle: (name: string) => `${name} · Turismo en tu Mano`,
  metaDescription:
    "Turismo y comercio local de Chile, de Arica a Magallanes: regiones, comunas, panoramas, rutas y negocios locales.",
};
