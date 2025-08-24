import { WeatherOverlayProps } from "@types";
import { Component, createEffect, onCleanup, onMount } from "solid-js";
import L from "leaflet";
import { locationService } from "@services";

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
    }
  });

  createEffect(() => {
    if (leafMap) {
      const latLon = locationService.getLatLng();
      const bounds = locationService.getBounds();
      leafMap.setView([latLon.lat, latLon.lng], bounds.zoom);
      leafMap.setMaxBounds();
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
