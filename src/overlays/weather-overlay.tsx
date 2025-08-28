// Overlays don't render any component, only provide UI/Info to the existing map.

import {
  locationService,
  mapService,
  svgService,
  weatherService,
} from "@services";
import { Component, createSignal, onMount, Show } from "solid-js";

import L from "leaflet";

export const WeatherOverlay: Component = () => {
  const [testIcon, setTestIcon] = createSignal<SVGSVGElement>();

  // Initial load, get all weather icons for current bounts.
  onMount(async () => {
    const map = mapService.getMap();
    if (map) {
      map.on("zoomend", () => {
        svgService.onZoomEnd(map);
      });

      //Fetch settlements,
      //TODO: Should be moved to a CityOverlay eventually.
      const settlements = await locationService.getNearbySettlements();
      console.log(`Found ${settlements.length} settlements:`, settlements);

      // If no settlements are found, something went wrong.
      if (settlements.length <= 0) {
        console.log(
          "WeatherOverlay failed to find any nearby settlements (URGENT FIX REQUIRED)",
        );
      }

      // Get weather data for settlements by their bounds
      const realtimeWeatherArr =
        await weatherService.getRealtimeWeatherForSettlements(settlements);
      console.log(
        `Got weather data for ${realtimeWeatherArr.length} settlements:`,
        realtimeWeatherArr,
      );

      const icons = realtimeWeatherArr.map((realtimeWeather) =>
        svgService.getWeatherIcon(realtimeWeather),
      );

      icons.forEach((icon, index) => {
        const settlementBounds = icon.weatherData.settlementBounds;
        const settlementCenter = settlementBounds.getCenter();
        const zoom = map.getZoom();

        const boundsMod = svgService.createSmallBounds(settlementCenter, zoom);

        console.log(`Adding overlay ${index + 1}:`, {
          center: settlementCenter,
          bounds: boundsMod,
          weatherData: icon.weatherData,
        });

        const svgOverlay = L.svgOverlay(icon.svg, boundsMod);
        svgService.addSVGOverlay(svgOverlay, icon.svg);

        svgOverlay.addTo(map);
        console.log(`Successfully added overlay ${index + 1} to map`);
      });
    }
  });

  // Edit visible icons based on updated bounds (zoomend + dragend)
  // createEffect();

  return <></>;
  // Renders empty HTML. This element listens for changes in mapService.map and adjusts weather icons accordingly.
};
