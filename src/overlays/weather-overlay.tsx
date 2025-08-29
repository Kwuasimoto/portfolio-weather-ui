// Overlays don't render any component, only provide UI/Info to the existing map.

import {
  locationService,
  mapService,
  svgService,
  weatherService,
} from "@services";
import { Component, onMount } from "solid-js";

import L from "leaflet";

export const WeatherOverlay: Component = () => {
  // Initial load, get all weather icons for current bounts.
  onMount(async () => {
    const map = mapService.getMap();
    if (map) {
      map.on("zoomend", () => {
        svgService.onZoomEnd(map);
      });

      //Fetch settlements,
      //TODO: Should be moved to a CityOverlay eventually.
      //TODO: Features should be built before this function, idk how we determine how many to build tho.
      const mapFeatures = await locationService.getNearbySettlements();

      // Set map to the generated features.
      mapFeatures.forEach((mapFeature) => mapFeature.setMap(map));

      // Get weather data for settlements by their bounds.
      await weatherService.getRealtimeWeatherForSettlements(mapFeatures);

      // Get icons from memory.
      svgService.getWeatherIcons(mapFeatures);

      // loop mapFeatures to SVG Overlays and add to map.
      mapFeatures.forEach((mapFeature, index) => {
        const svg = mapFeature.getSVG();
        const weather = mapFeature.getWeather();
        const settlement = mapFeature.getSettlement();

        const settlementBounds = settlement.bounds;
        const settlementCenter = settlementBounds.getCenter();

        const initialBounds = svgService.createInitialBounds(mapFeature);

        console.log(`Adding overlay ${index + 1}:`, {
          center: settlementCenter,
          bounds: initialBounds,
          weatherData: weather,
        });

        const svgOverlay = L.svgOverlay(svg, initialBounds);
        mapFeature.setSVGOverlay(svgOverlay);

        svgService.addSVGOverlay(mapFeature);
        svgOverlay.addTo(map);

        console.log("Successfully added feature", mapFeature.json());
      });
    }
  });

  return <></>;
  // Renders empty HTML. This element listens for changes in mapService.map and adjusts weather icons accordingly.
};
