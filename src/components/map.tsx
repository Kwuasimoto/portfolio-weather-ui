import { LatLng, Position, WeatherData } from "@types";
import { Component, createEffect, onCleanup, onMount } from "solid-js";
import { locationService } from "@services";
import L, { latLngBounds, LatLngBounds } from "leaflet";
import { render } from "solid-js/web";
import { Icons } from "@icons";

import sun from "./images/sun_clear.svg?raw";

// Example weather data
export const sampleWeatherData: WeatherData[] = [
  {
    id: "0",
    loc: { lat: 43.79961146743126, lng: -80.93627929687501 },
    timestamp: Date.now(),
    temperature: 22,
    condition: Icons.SUN_CLEAR,
    location: "Toronto",
    humidity: 45,
    windSpeed: 12,
    description: "Clear and sunny",
  },
];

export type WeatherOverlayProps = {
  weather?: WeatherData;
  position?: Position;
};

export const Map: Component<WeatherOverlayProps> = (props) => {
  let mapRef: HTMLDivElement | undefined;
  let leafMap: L.Map | undefined;

  onMount(() => {
    console.log("Rendering...");
    if (mapRef) {
      leafMap = L.map(mapRef);
      leafMap.addEventListener("zoomend", () => {
        locationService.onZoomEnd(leafMap);
      });
      leafMap.addEventListener("dragend", () => {
        locationService.onDragEnd(leafMap);
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(leafMap);
      // L.marker([44.34550721541841, -79.69688415527345]).addTo(leafMap);

      var svgElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgElement.setAttribute("viewBox", "0 0 200 200");
      svgElement.innerHTML =
        '<rect width="200" height="200"/><rect x="75" y="23" width="50" height="50" style="fill:red"/><rect x="75" y="123" width="50" height="50" style="fill:#0013ff"/>';
      var svgElementBounds = latLngBounds([
        [44.34550721541841, -79.69688415527345],
        [44.24550721541841, -79.59688415527345],
      ]);
      L.svgOverlay(svgElement, svgElementBounds).addTo(leafMap);
    }
  });

  createEffect(() => {
    if (leafMap) {
      const latLon = locationService.getLatLng();
      const bounds = locationService.getBounds();
      leafMap.setView([latLon.lat, latLon.lng], bounds.zoom);
      leafMap.setMaxBounds();
      console.log("CENTER", leafMap.getCenter());
      console.log("ZOOM", leafMap.getZoom());
      console.log("BOUNDS", leafMap.getBounds());
      console.log("MINMAXZOOM", leafMap.getMinZoom(), leafMap.getMaxZoom());
      console.log("SIZE", leafMap.getSize());
      console.log("PIXELBOUNDS", leafMap.getPixelBounds());
    }
  });

  onCleanup(() => {
    if (leafMap) {
      console.log("Removing leaf map");
      leafMap.removeEventListener("zoomend");
      leafMap.removeEventListener("dragend");
      leafMap.remove();
    }
  });

  return <div class="stretched z-0" ref={mapRef} />;
};
