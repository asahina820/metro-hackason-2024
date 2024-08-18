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

map.on("load", () => {
  // ユーザーの位置が取得されたときの処理
  geolocateControl.on("geolocate", (position) => {
    const currentLocation = [position.coords.longitude, position.coords.latitude];
    console.log("User Coordinates:", currentLocation);
  });
});

export { currentLocation };
