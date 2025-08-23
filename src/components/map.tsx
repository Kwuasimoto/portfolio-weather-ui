import { WeatherOverlayProps } from "@types";
import { Component, createSignal, JSXElement, onMount } from "solid-js";
import L from "leaflet";

export const Map: Component<WeatherOverlayProps> = (props) => {
  let mapRef: HTMLDivElement | undefined;
  let leafMap: L.Map | undefined;

  onMount(() => {
    console.log("Rendering...");
    if (mapRef) {
      leafMap = L.map(mapRef).setView([51.505, -0.09], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(leafMap);
    }
  });

  return <div class="stretched z-0" ref={mapRef} />;
};
