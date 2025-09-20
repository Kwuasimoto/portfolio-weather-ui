// Overlays don't render any component, only provide UI/Info to the existing map.

import {
  featureService,
  locationService,
  mapService,
  svgService,
  weatherService,
} from "@services";
import { Component, onMount } from "solid-js";

import L from "leaflet";
import { useWeatherTooltip } from "@hooks";
import { imgService } from "src/services/img-service";

export const WeatherOverlay: Component = () => {
  const { setWeatherTooltipMapFeature, getWeatherTooltipMapFeature } =
    useWeatherTooltip();

  // Initial load, get all weather icons for current bounts.
  onMount(async () => {
    const map = mapService.getMap();
    if (map)
      map.on("zoomend", () => {
        // svgService.onZoomEnd(map);
      });

    //Fetch settlements,
    //TODO: Should be moved to a CityOverlay eventually.
    //TODO: Features should be built before this function, idk how we determine how many to build tho.
    const mapFeatures = await locationService.getNearbySettlements();

    // Add generated features to service
    featureService.addMany(mapFeatures);

    // Set map to the generated features.
    mapFeatures.forEach((mapFeature) => mapFeature.setMap(map!));

    // Get weather data for settlements by their bounds.
    await weatherService.getRealtimeWeatherForSettlements(mapFeatures);

    // Get icons from memory.
    imgService.getWeatherIcons(mapFeatures);

    // loop mapFeatures to SVG Overlays and add to map.
    mapFeatures.forEach((mapFeature) => {
      // mapFeature should be populated with enough information at this point to set its internal ID.
      mapFeature.setId();

      const settlement = mapFeature.getSettlement();

      const marker = L.marker(settlement.bounds.getCenter(), {
        icon: mapFeature.getIcon(),
      });

      marker.on("click", () => {
        setWeatherTooltipMapFeature(mapFeature);
        console.log("Tooltip state", getWeatherTooltipMapFeature());
      });

      marker.addTo(map!);
      console.log("Successfully added feature", mapFeature.json());
    });
  });

  return <></>;
  // Renders empty HTML. This element listens for changes in mapService.map and adjusts weather icons accordingly.
};
