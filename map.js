// map.js

// MapLibre GL JSのマップ設定
const map = new maplibregl.Map({
  container: "map",
  center: [139.770692, 35.768351], // 中心座標
  zoom: 16, // ズームレベル
  pitch: 30,
  maxPitch: 85,
  bearing: -60,
  style: getMapStyle(), // マップスタイルを外部関数から取得
  attributionControl: false,
});

// Attributionを折りたたみ表示
map.addControl(
  map.addControl(
    new maplibregl.AttributionControl({
      compact: true,
    }),
    "top-right"
  )
);

// マップスタイルの設定を外部関数化
function getMapStyle() {
  return {
    version: 8,
    glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
    sources: getMapSources(),
    layers: getMapLayers(),
    sky: {
      "sky-color": "#199EF3",
      "sky-horizon-blend": 0.5,
      "horizon-color": "#ffffff",
      "horizon-fog-blend": 0.5,
      "fog-color": "#0000ff",
      "fog-ground-blend": 0.5,
      "atmosphere-blend": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        1,
        10,
        1,
        12,
        0,
      ],
    },
  };
}

// マップソースの設定を外部関数化
function getMapSources() {
  return {
    "background-osm-raster": {
      type: "raster",
      tiles: [
        "https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        "<a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a>",
    },
    stop: {
      type: "geojson",
      data: "./data/stops.geojson",
      attribution:
        "コンテンツ等の提供者名: 東京都交通局・公共交通オープンデータ協議会",
    },
    geogence: {
      type: "geojson",
      data: "./data/stops_buffer.geojson ",
    },
    route: {
      type: "geojson",
      data: "./data/route.geojson",
    },
    "plateau-bldg": {
      type: "vector",
      tiles: ["https://indigo-lab.github.io/plateau-lod2-mvt/{z}/{x}/{y}.pbf"],
      minzoom: 10,
      maxzoom: 16,
      attribution:
        "<a href='https://github.com/indigo-lab/plateau-lod2-mvt'>plateau-lod2-mvt by indigo-lab</a>",
    },
  };
}

// マップレイヤーの設定を外部関数化
function getMapLayers() {
  return [
    {
      id: "background-osm-raster",
      type: "raster",
      source: "background-osm-raster",
    },
    {
      id: "bldg",
      type: "fill-extrusion",
      source: "plateau-bldg",
      "source-layer": "bldg",
      paint: {
        "fill-extrusion-height": ["*", ["get", "z"], 1],
        "fill-extrusion-color": "#f0f0f0",
        "fill-extrusion-opacity": 0.3,
      },
    },
    {
      id: "line-layer",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#eb347c",
        "line-width": 5,
      },
    },
    {
      id: "symbol-layer",
      type: "symbol",
      source: "stop",
      layout: {
        "text-field": ["get", "stop_name"],
      },
    },
    {
      id: "buffer-layer",
      type: "fill",
      source: "geogence",
      paint: {
        "fill-color": "#ff0000",
        "fill-opacity": 0.5,
      },
    },
  ];
}

// GeoJSONデータの読み込み
function loadGeoJsonData(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then(callback)
    .catch((error) =>
      console.error(`Error loading GeoJSON data from ${url}:`, error)
    );
}

export { map, loadGeoJsonData };
