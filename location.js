import { map } from "./map.js";

const geolocateControl = new maplibregl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  fitBoundsOptions: { maxZoom: 18 },
  trackUserLocation: true,
  showUserLocation: true,
});

map.addControl(geolocateControl);

let currentLocation;

//ジオリファレンスの判定関数
const filePath = './data/stops_buffer.geojson';

// geojsonファイルを読み込む
async function loadGeoJSON() {
  try {
    const response = await fetch(filePath);
    const data = await response.json();  // JSONとしてデータをパース
    console.log(data);  // データをコンソールに表示
    return data;  // 読み込んだデータを返す
  } catch (error) {
    console.error('ファイルの読み込みに失敗しました:', error);
  }
}


const geofence = {
  "type": "Feature",
  "properties": {},
  "geometry": {
      "type": "Polygon",
      "coordinates": [
          [
              [139.6897, 35.6895],
              [139.7937, 35.6895],
              [139.7937, 35.7815],
              [139.6897, 35.7815],
              [139.6897, 35.6895]
          ]
      ]
  }
};
// 時間を判定
function isInOperatingHours() {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 10 && hours <= 19;  // 10時から11時までの間
}

// 
function watchUserPosition() {
  if (!isInOperatingHours()) {
    console.log("時間外です");
    return;
  }

  const inside = turf.booleanPointInPolygon(
    currentLocation,
    geofence
  );
  if (inside) {
    console.log("ユーザーはジオフェンス内にいます");
  } else {
    console.log("ユーザーはジオフェンス外にいます");
  }
}

map.on("load", () => {
  // ユーザーの位置が取得されたときの処理
  geolocateControl.on("geolocate", (position) => {
    currentLocation = [position.coords.longitude, position.coords.latitude];
    console.log("User Coordinates:", currentLocation);
    watchUserPosition() 
  });

});

export { currentLocation };
