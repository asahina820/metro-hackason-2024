// MapLibre GL JSのマップ設定
const map = new maplibregl.Map({
  container: "map",
  center: [139.770692, 35.768351], // 中心座標
  zoom: 13.5, // ズームレベル
  pitch: 30,
  maxPitch: 85,
  bearing: -80,
  style: getMapStyle(), // マップスタイルを外部関数から取得
});

map.on("load", () => {
  loadGeoJsonData("./data/stops.geojson", processStopsData);
});

// マップスタイルの設定を外部関数化
function getMapStyle() {
  return {
    version: 8,
    glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
    sources: getMapSources(),
    layers: getMapLayers(),
    terrain: {
      source: "aws-terrain",
      exaggeration: 1,
    },
    sky: {
      "sky-color": "#199EF3",
      "sky-horizon-blend": 0.5,
      "horizon-color": "#ffffff",
      "horizon-fog-blend": 0.5,
      "fog-color": "#0000ff",
      "fog-ground-blend": 0.5,
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 10, 1, 12, 0],
    },
  };
}

// マップソースの設定を外部関数化
function getMapSources() {
  return {
    "background-osm-raster": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "<a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a>",
    },
    "aws-terrain": {
      type: "raster-dem",
      minzoom: 1,
      maxzoom: 15,
      encoding: "terrarium",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      attribution: "ArcticDEM terrain data DEM(s) were created from DigitalGlobe, Inc., imagery and funded under National Science Foundation awards...",
    },
    stop: {
      type: "geojson",
      data: "./data/stops.geojson",
      attribution: "コンテンツ等の提供者名: 東京都交通局・公共交通オープンデータ協議会",
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
      attribution: "<a href='https://github.com/indigo-lab/plateau-lod2-mvt'>plateau-lod2-mvt by indigo-lab</a>",
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
      id: "point-layer",
      type: "circle",
      source: "stop",
      paint: {
        "circle-stroke-width": 5,
        "circle-stroke-color": "black",
        "circle-opacity": 0,
        "circle-radius": 20,
        "circle-stroke-opacity": 0.5,
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
  ];
}

// GeoJSONデータの読み込み
function loadGeoJsonData(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then(callback)
    .catch((error) => console.error(`Error loading GeoJSON data from ${url}:`, error));
}

// 駅データの処理
function processStopsData(stopsData) {
  const minumadai = findStation(stopsData, "見沼代親水公園");
  const nippori = findStation(stopsData, "日暮里");

  if (!minumadai || !nippori) {
    console.error("指定された駅が見つかりませんでした。");
    return;
  }

  const minumadaiCoords = minumadai.geometry.coordinates;
  const nipporiCoords = nippori.geometry.coordinates;

  loadGeoJsonData("./data/route.geojson", (routeData) => processRouteData(routeData, minumadaiCoords, nipporiCoords));
}

// 駅名で駅を検索
function findStation(stopsData, stationName) {
  return stopsData.features.find((feature) => feature.properties.stop_name === stationName);
}

// 路線データの処理
function processRouteData(routeData, minumadaiCoords, nipporiCoords) {
  const segment = getRouteSegment(routeData, minumadaiCoords, nipporiCoords);
  const length = turf.length(segment);

  document.getElementById("start-button").addEventListener("click", () => startAnimation(segment, length));
}

// 路線セグメントの取得
function getRouteSegment(routeData, startCoords, endCoords) {
  const multiLineCoords = routeData.features[0].geometry.coordinates.flat();
  const segment = turf.lineSlice(turf.point(startCoords), turf.point(endCoords), turf.lineString(multiLineCoords));
  const reversedSegmentCoords = segment.geometry.coordinates.reverse();
  return turf.lineString(reversedSegmentCoords);
}

// アニメーションの開始
function startAnimation(segment, length) {
  let trainCounter = 0;
  const intervalDelay = 10000; // 10秒ごとに出発
  const trainSpacing = 2 * 0.002; // 2駅分の距離を設定

  let initialDelay = 0;
  let currentProgress = 0;

  while (currentProgress < 1) {
    createTrain(segment, length, initialDelay, trainCounter++);
    currentProgress += trainSpacing;
    initialDelay += intervalDelay;
  }
}

// 電車の生成とアニメーション
function createTrain(segment, length, initialDelay, trainId) {
  let progress = 0;

  function animate() {
    if (progress > 1) {
      removeTrain(trainId);
      return;
    }

    const point = turf.along(segment, length * progress).geometry.coordinates;
    const nextProgress = Math.min(progress + 0.002, 1);
    const nextPoint = turf.along(segment, length * nextProgress).geometry.coordinates;
    const angle = turf.bearing(turf.point(point), turf.point(nextPoint));

    const polygonCoordinates = createTrainPolygon(point, angle);

    updateOrCreateTrainLayer(trainId, polygonCoordinates);

    progress += 0.0005;
    requestAnimationFrame(animate);
  }

  setTimeout(animate, initialDelay);
}

// 電車ポリゴンの生成
function createTrainPolygon(point, angle) {
  const width = 0.0009; // 横の長さ
  const height = 0.002; // 縦の長さ
  const noseLength = 0.0003; // 電車の先端の長さ

  let polygonCoordinates = [
    [point[0] - width / 2, point[1] - height / 2], // 左後方
    [point[0] + width / 2, point[1] - height / 2], // 右後方
    [point[0] + width / 2, point[1] + height / 2 - noseLength], // 右前方
    [point[0], point[1] + height / 2], // 先端
    [point[0] - width / 2, point[1] + height / 2 - noseLength], // 左前方
    [point[0] - width / 2, point[1] - height / 2], // 左後方に戻る
  ];

  return rotatePolygon(polygonCoordinates, angle, point);
}

// ポリゴンを回転
function rotatePolygon(polygonCoordinates, angle, origin) {
  return polygonCoordinates.map((coord) => {
    const rotated = turf.rhumbDestination(turf.point(origin), turf.distance(turf.point(origin), turf.point(coord)), angle + turf.bearing(turf.point(origin), turf.point(coord))).geometry.coordinates;
    return rotated;
  });
}

// 電車のレイヤーを更新または作成
function updateOrCreateTrainLayer(trainId, polygonCoordinates) {
  const sourceId = `train-${trainId}`;

  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [polygonCoordinates],
      },
    });
  } else {
    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [polygonCoordinates],
        },
      },
    });

    map.addLayer({
      id: sourceId,
      type: "fill-extrusion",
      source: sourceId,
      paint: {
        "fill-extrusion-color": "#00ff00",
        "fill-extrusion-height": 100, // 高さを100に設定
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.8,
      },
    });
  }
}

// 電車を削除
function removeTrain(trainId) {
  const sourceId = `train-${trainId}`;
  if (map.getSource(sourceId)) {
    map.removeLayer(sourceId);
    map.removeSource(sourceId);
  }
}
