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
    console.log("Weather overlay initialized");
    const map = mapService.getMap();
    if (map) {
      // Set up automatic weather fetching on map events
      map.on("zoomend", async () => {
        locationService.onZoomEnd(map);
        await featureService.autoFetchWeatherForCurrentBounds(map, setWeatherTooltipMapFeature);
      });

      map.on("dragend", async () => {
        locationService.onDragEnd(map);
        await featureService.autoFetchWeatherForCurrentBounds(map, setWeatherTooltipMapFeature);
      });

      // Initial weather fetch for current bounds
      await featureService.autoFetchWeatherForCurrentBounds(map, setWeatherTooltipMapFeature);
    }
    setMounted(true);
  });

  createEffect(() => {
    if (!mounted()) return;
    const map = mapService.getMap();
    if (map) {
      const features = featureService.getMapFeatures();

      if (features.length === 0) {
        return;
      }

      // Use the same centralized function to create markers
      featureService.createMarkersOnMap(map, setWeatherTooltipMapFeature);
    }
  });

  return <></>;
  // Renders empty HTML. This element listens for changes in mapService.map and adjusts weather icons accordingly.
};
