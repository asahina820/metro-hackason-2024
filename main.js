// PMTilesの、MapLibre GL JS用のプロトコルをグローバルに追加
let protocol = new pmtiles.Protocol();
// addProtocolで、カスタムURLスキーマを使用するときに呼び出される関数を追加する
// pmtiles://~~ が使用されたときに、protocol.tileが呼び出される
maplibregl.addProtocol("pmtiles", protocol.tile);

const map = new maplibregl.Map({
  container: "map",
  center: [139.770707, 35.814541], // 中心座標
  zoom: 16, // ズームレベル
  pitch: 73,
  maxPitch: 85, // 最大の傾き、デフォルトは60
  style: {
    // スタイル仕様のバージョン番号。8を指定する
    version: 8,
    glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
    // データソース
    sources: {
      // 背景地図 OpenStreetMapのラスタタイル
      "background-osm-raster": {
        // ソースの種類。vector、raster、raster-dem、geojson、image、video のいずれか
        type: "raster",
        // タイルソースのURL
        tiles: ["https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png"],
        // タイルの解像度。単位はピクセル、デフォルトは512
        tileSize: 256,
        // データの帰属
        attribution: "<a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a>",
      },
      // 地形データ
      "aws-terrain": {
        type: "raster-dem",
        // タイルが利用可能な最小ズームレベル
        minzoom: 1,
        // タイルが利用可能な最大ズームレベル
        maxzoom: 15,
        // このソースが使用するエンコーディング。terrarium（Terrarium形式のPNGタイル）、mapbox（Mapbox Terrain RGBタイル）、custom のいずれか
        encoding: "terrarium",
        tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
        attribution:
          // see 'https://github.com/tilezen/joerd/blob/master/docs/attribution.md'
          "\
          ArcticDEM terrain data DEM(s) were created from DigitalGlobe, Inc., imagery and funded under National Science Foundation awards 1043681, 1559691, and 1542736; \
          Australia terrain data © Commonwealth of Australia (Geoscience Australia) 2017;\
          Austria terrain data © offene Daten Österreichs – Digitales Geländemodell (DGM) Österreich;\
          Canada terrain data contains information licensed under the Open Government Licence – Canada;\
          Europe terrain data produced using Copernicus data and information funded by the European Union - EU-DEM layers;\
          Global ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration\
          Mexico terrain data source: INEGI, Continental relief, 2016;\
          New Zealand terrain data Copyright 2011 Crown copyright (c) Land Information New Zealand and the New Zealand Government (All rights reserved);\
          Norway terrain data © Kartverket;\
          United Kingdom terrain data © Environment Agency copyright and/or database right 2015. All rights reserved;\
          United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey.",
      },
      // 駅名
      stop: {
        type: "geojson",
        // GeoJSONファイルのURL
        data: "./data/stops.geojson",
        attribution: "コンテンツ等の提供者名: 東京都交通局・公共交通オープンデータ協議会",
      },
      // 路線
      route: {
        type: "geojson",
        data: "./data/route.geojson",
      },
      // 3D都市モデル（Project PLATEAU）東京都23区（2020年度）建物データ
      "plateau-bldg": {
        type: "vector",
        tiles: ["https://indigo-lab.github.io/plateau-lod2-mvt/{z}/{x}/{y}.pbf"],
        minzoom: 10,
        maxzoom: 16,
        attribution: "<a href='https://github.com/indigo-lab/plateau-lod2-mvt'>plateau-lod2-mvt by indigo-lab</a> (<a href='https://www.mlit.go.jp/plateau/'>国土交通省 Project PLATEAU</a> のデータを加工して作成)",
      },
    },
    // 表示するレイヤ
    layers: [
      // 背景地図としてOpenStreetMapのラスタタイルを追加
      {
        // 一意のレイヤID
        id: "background-osm-raster",
        // レイヤの種類。background、fill、line、symbol、raster、circle、fill-extrusion、heatmap、hillshade のいずれか
        type: "raster",
        // データソースの指定
        source: "background-osm-raster",
      },
      {
        id: "line-layer",
        type: "line",
        source: "route",
        paint: {
          // ラインの色
          "line-color": "#eb347c",
          // ラインの幅
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
      // // PLATEAU 建物データ
      // {
      //   id: "bldg",
      //   type: "fill-extrusion",
      //   source: "plateau-bldg",
      //   // ベクタタイルソースから使用するレイヤ
      //   "source-layer": "bldg",
      //   paint: {
      //     // 高さ
      //     "fill-extrusion-height": ["*", ["get", "z"], 1],
      //     // 塗りつぶしの色
      //     "fill-extrusion-color": "#f0f0f0",
      //     // 透明度
      //     "fill-extrusion-opacity": 0.3,
      //   },
      // },
    ],
    // 地形
    terrain: {
      // 地形データのソース
      source: "aws-terrain",
      // 標高の誇張度
      exaggeration: 1,
    },
    sky: {
      // 空のベースカラー
      "sky-color": "#199EF3",
      // 空の色と水平線の色の混ぜ合わせ。1は空の真ん中の色を、0は空の色を使用する
      "sky-horizon-blend": 0.5,
      // 地平線のベースカラー
      "horizon-color": "#ffffff",
      // 霧の色と水平線の色の混ぜ合わせ。0は水平線の色、1は霧の色を使用する
      "horizon-fog-blend": 0.5,
      // 霧のベースカラー。 3D地形が必要
      "fog-color": "#0000ff",
      // 3D地形に霧を混ぜ合わせる。 0はマップの中心、1は地平線
      "fog-ground-blend": 0.5,
      // 大気の混ぜ合わせ。 1が可視大気、0が非表示大気
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 10, 1, 12, 0],
    },
  },
});

map.on("load", () => {
  fetch("./data/stops.geojson")
    .then((response) => response.json())
    .then((stopsData) => {
      const minumadai = stopsData.features.find((feature) => feature.properties.stop_name === "見沼代親水公園");
      const nippori = stopsData.features.find((feature) => feature.properties.stop_name === "日暮里");

      if (!minumadai || !nippori) {
        console.error("指定された駅が見つかりませんでした。");
        return;
      }

      const minumadaiCoords = minumadai.geometry.coordinates;
      const nipporiCoords = nippori.geometry.coordinates;

      fetch("./data/route.geojson")
        .then((response) => response.json())
        .then((routeData) => {
          const multiLineCoords = routeData.features[0].geometry.coordinates.flat();
          const segment = turf.lineSlice(turf.point(minumadaiCoords), turf.point(nipporiCoords), turf.lineString(multiLineCoords));

          const reversedSegmentCoords = segment.geometry.coordinates.reverse();
          const reversedSegment = turf.lineString(reversedSegmentCoords);

          const length = turf.length(reversedSegment);

          function startAnimation() {
            let progress = 0;

            function animate() {
              if (progress > 1) {
                return;
              }

              const point = turf.along(reversedSegment, length * progress).geometry.coordinates;
              const nextProgress = Math.min(progress + 0.002, 1);
              const nextPoint = turf.along(reversedSegment, length * nextProgress).geometry.coordinates;
              const angle = turf.bearing(turf.point(point), turf.point(nextPoint));

              const width = 0.0007;
              const height = 0.002;
              let polygonCoordinates = [
                [point[0] - width / 2, point[1] - height / 2],
                [point[0] + width / 2, point[1] - height / 2],
                [point[0] + width / 2, point[1] + height / 2],
                [point[0] - width / 2, point[1] + height / 2],
                [point[0] - width / 2, point[1] - height / 2],
              ];

              polygonCoordinates = rotatePolygon(polygonCoordinates, angle, point);

              if (map.getSource("polygon-source")) {
                map.getSource("polygon-source").setData({
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [polygonCoordinates],
                  },
                });
              } else {
                map.addSource("polygon-source", {
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
                  id: "polygon-layer",
                  type: "fill-extrusion",
                  source: "polygon-source",
                  paint: {
                    "fill-extrusion-color": "#00ff00",
                    "fill-extrusion-height": 50,
                    "fill-extrusion-base": 0,
                    "fill-extrusion-opacity": 0.8,
                  },
                });
              }

              map.easeTo({
                center: point,
                bearing: angle,
                duration: 100,
              });

              progress += 0.002;
              requestAnimationFrame(animate);
            }

            animate();
          }

          document.getElementById("start-button").addEventListener("click", startAnimation);
        });
    });
});

function rotatePolygon(polygonCoordinates, angle, origin) {
  return polygonCoordinates.map((coord) => {
    const rotated = turf.rhumbDestination(turf.point(origin), turf.distance(turf.point(origin), turf.point(coord)), angle + turf.bearing(turf.point(origin), turf.point(coord))).geometry.coordinates;
    return rotated;
  });
}
