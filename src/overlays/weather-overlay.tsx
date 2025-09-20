// Overlays don't render any component, only provide UI/Info to the existing map.

import {
  featureService,
  locationService,
  mapService,
  weatherService,
} from "@services";
import { Component, createEffect, createSignal, onMount } from "solid-js";
import { useWeatherTooltip } from "@hooks";

export const WeatherOverlay: Component = () => {
  const [mounted, setMounted] = createSignal<boolean>(false);
  const { setWeatherTooltipMapFeature, getWeatherTooltipMapFeature } =
    useWeatherTooltip();

  // Initial load, get all weather icons for current bounds.
  onMount(async () => {
    console.log("Running onMount");
    const map = mapService.getMap();
    if (map) {
      map.on("zoomend", () => {
        // svgService.onZoomEnd(map);
      });

      //Fetch settlements,
      //TODO: Should be moved to a CityOverlay eventually.
      //TODO: Features should be built before this function, idk how we determine how many to build tho.
      const mapFeatures = await locationService.getNearbySettlements();

      console.log(`onMount fetched ${mapFeatures.length} features`);

      // Add generated features to service
      featureService.addMany(mapFeatures);

      // Set map to the generated features.
      mapFeatures.forEach((mapFeature) => mapFeature.setMap(map!));

      // Get weather data for settlements by their bounds.
      await weatherService.getRealtimeWeatherForSettlements(mapFeatures);

      // Create markers using centralized function
      featureService.createMarkersOnMap(map, setWeatherTooltipMapFeature);
    }
    setMounted(true);
  });

  createEffect(() => {
    if (!mounted()) return;
    console.log("Running createEffect");
    const map = mapService.getMap();
    if (map) {
      const features = featureService.getMapFeatures();

      if (features.length === 0) {
        return;
      }

      console.log(`Updating markers for ${features.length} features`, features);

      // Use the same centralized function to create markers
      featureService.createMarkersOnMap(map, setWeatherTooltipMapFeature);
    }
  });

  return <></>;
  // Renders empty HTML. This element listens for changes in mapService.map and adjusts weather icons accordingly.
};
