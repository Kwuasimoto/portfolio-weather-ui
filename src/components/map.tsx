import { Component, createEffect, onCleanup, onMount } from "solid-js";
import { locationService, mapService, svgService } from "@services";

import L from "leaflet";
import { WeatherOverlay } from "@overlays";
import { WeatherTooltip } from "./weather-tooltip";
import { Watermark } from "./watermark";

export const Map: Component = () => {
  let mapRef: HTMLDivElement | undefined;
  let leafMap: L.Map | undefined;

  onMount(() => {
    if (mapRef) {
      leafMap = L.map(mapRef);
      mapService.setMap(leafMap);

      const tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
        },
      );

      tileLayer.addTo(leafMap);
    }
  });

  createEffect(() => {
    if (leafMap) {
      const latLon = locationService.getLatLng();
      const bounds = locationService.getBounds();

      leafMap.setView([latLon.lat, latLon.lng], bounds.zoom);
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

  return (
    <>
      <div class="stretched z-0" ref={mapRef} />
      <WeatherTooltip />
      <WeatherOverlay />
      <Watermark />
    </>
  );
};
