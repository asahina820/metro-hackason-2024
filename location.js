import { map } from "./map.js";

const geolocateControl = new maplibregl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  fitBoundsOptions: { maxZoom: 18, bearing: 0 },
  trackUserLocation: true,
  showUserLocation: true,
});

map.addControl(geolocateControl);

let currentLocation;

//ジオリファレンスの判定関数
const filePath = "./data/stops_buffer.geojson";

// geojsonファイルを読み込む
async function loadGeoJSON() {
  try {
    const response = await fetch(filePath);
    const data = await response.json(); // JSONとしてデータをパース
    console.log(data); // データをコンソールに表示
    return data; // 読み込んだデータを返す
  } catch (error) {
    console.error("ファイルの読み込みに失敗しました:", error);
  }
}

const geofence = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [
          [139.771821, 35.728793],
          [139.771786739561406, 35.728576688103942],
          [139.771687311896045, 35.728381550323398],
          [139.771532449676585, 35.728226688103938],
          [139.771337311896048, 35.728127260438598],
          [139.771121, 35.728093],
          [139.77090468810394, 35.728127260438598],
          [139.770709550323403, 35.728226688103938],
          [139.770554688103942, 35.728381550323398],
          [139.770455260438581, 35.728576688103942],
          [139.770421, 35.728793],
          [139.770455260438581, 35.729009311896064],
          [139.770554688103942, 35.729204449676608],
          [139.770709550323403, 35.729359311896069],
          [139.77090468810394, 35.729458739561409],
          [139.771121, 35.729493],
          [139.771337311896048, 35.729458739561409],
          [139.771532449676585, 35.729359311896069],
          [139.771687311896045, 35.729204449676608],
          [139.771786739561406, 35.729009311896064],
          [139.771821, 35.728793],
        ],
      ],
    ],
  },
};

[
  [
    [139.771821, 35.728793],
    [139.771786739561406, 35.728576688103942],
    [139.771687311896045, 35.728381550323398],
    [139.771532449676585, 35.728226688103938],
    [139.771337311896048, 35.728127260438598],
    [139.771121, 35.728093],
    [139.77090468810394, 35.728127260438598],
    [139.770709550323403, 35.728226688103938],
    [139.770554688103942, 35.728381550323398],
    [139.770455260438581, 35.728576688103942],
    [139.770421, 35.728793],
    [139.770455260438581, 35.729009311896064],
    [139.770554688103942, 35.729204449676608],
    [139.770709550323403, 35.729359311896069],
    [139.77090468810394, 35.729458739561409],
    [139.771121, 35.729493],
    [139.771337311896048, 35.729458739561409],
    [139.771532449676585, 35.729359311896069],
    [139.771687311896045, 35.729204449676608],
    [139.771786739561406, 35.729009311896064],
    [139.771821, 35.728793],
  ],
];

// 時間を判定
function isInOperatingHours() {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 10 && hours <= 12; // 10時から11時までの間
}

function watchUserPosition() {
  const campaignSections = document.getElementById("campaign-sections");
  const messageSection = document.getElementById("message-section");
  const areaMessage = document.getElementById("area-message");
  const timeMessage = document.getElementById("time-message");
  let showAreaMessage = false;
  let showTimeMessage = false;

  if (!isInOperatingHours()) {
    console.log("時間外です");
    showTimeMessage = true;
  }

  const inside = turf.booleanPointInPolygon(currentLocation, geofence);

  if (inside) {
    console.log("ユーザーはジオフェンス内にいます");
  } else {
    console.log("ユーザーはジオフェンス外にいます");
    showAreaMessage = true;
  }

  // ユーザの位置・時間によって画面の表示を出し分ける
  if (showAreaMessage || showTimeMessage) {
    campaignSections.classList.remove("slide-up");
    campaignSections.classList.add("hidden");
    messageSection.classList.remove("hidden");
    messageSection.classList.add("slide-up");
    areaMessage.style.display = showAreaMessage ? "block" : "none";
    timeMessage.style.display = showTimeMessage ? "block" : "none";
  } else {
    messageSection.classList.remove("slide-up");
    messageSection.classList.add("hidden");
    campaignSections.classList.remove("hidden");
    campaignSections.classList.add("slide-up");
  }
}

map.on("load", () => {
  // 現在地ボタンを自動的に押す
  geolocateControl.trigger();

  // ユーザーの位置が取得されたときの処理
  geolocateControl.on("geolocate", (position) => {
    currentLocation = [position.coords.longitude, position.coords.latitude];
    console.log("User Coordinates:", currentLocation);
    watchUserPosition();
  });
});

export { currentLocation };
