// Feature Cache system

import { State } from "@types";
import { createStore } from "solid-js/store";
import { MapFeature } from "src/wrappers";
import L from "leaflet";
import { imgService } from "./img-service";
import { locationService } from "./location-service";
import { weatherService } from "./weather-service";
import equal from "fast-deep-equal";

class FeatureService {
  private static instance: FeatureService;
  private readonly mapFeatures: State<MapFeature[]> = createStore<MapFeature[]>(
    [],
  );

  private constructor() {}

  public static getInstance() {
    if (!FeatureService.instance)
      FeatureService.instance = new FeatureService();
    return FeatureService.instance;
  }

  add(feature: MapFeature) {
    const exists = this.mapFeatures[0].some((f) =>
      equal(f.getSettlement(), feature.getSettlement()),
    );

    if (exists) {
      return;
    }

    this.mapFeatures[1]((prev) => [...prev, feature]);
  }

  addMany(features: MapFeature[]) {
    const newFeatures: MapFeature[] = [];
    let existingCount = 0;

    for (const feature of features) {
      const exists = this.mapFeatures[0].some((f) =>
        equal(f.getSettlement(), feature.getSettlement()),
      );
      if (exists) {
        existingCount++;
        continue;
      }
      newFeatures.push(feature);
    }

    if (newFeatures.length > 0) {
      console.log(`Added ${newFeatures.length} new features${existingCount > 0 ? ` (${existingCount} duplicates skipped)` : ''}`);
      this.mapFeatures[1]((prev) => [...prev, ...newFeatures]);
    }
  }

  getMapFeatures() {
    return this.mapFeatures[0];
  }

  createMarkersOnMap(
    map: L.Map,
    setWeatherTooltipMapFeature: (feature: MapFeature) => void,
  ) {
    const features = this.getMapFeatures();
    let markersCreated = 0;
    let markersUpdated = 0;
    let markersSkipped = 0;

    features.forEach((mapFeature) => {
      const existingMarker = mapFeature.getMarker();

      if (existingMarker) {
        // Check if weather data needs updating by comparing epochs
        const currentWeather = mapFeature.getWeather();
        if (currentWeather?.lastUpdatedEpoch) {
          // Find if there's a newer version of this feature in the current batch
          const newerFeature = features.find(f =>
            f !== mapFeature &&
            equal(f.getSettlement(), mapFeature.getSettlement()) &&
            f.getWeather()?.lastUpdatedEpoch > currentWeather.lastUpdatedEpoch
          );

          if (newerFeature) {
            // Remove old marker and replace with updated one
            existingMarker.remove();
            mapFeature.setWeather(newerFeature.getWeather()!);

            // Update icon with new weather data
            imgService.getWeatherIcons([mapFeature]);

            const newMarker = L.marker(mapFeature.getSettlement().bounds.getCenter(), {
              icon: mapFeature.getIcon(),
            });

            newMarker.on("click", () => {
              setWeatherTooltipMapFeature(mapFeature);
            });

            newMarker.addTo(map);
            mapFeature.setMarker(newMarker);
            markersUpdated++;
            return;
          }
        }

        markersSkipped++;
        return;
      }

      // Create new marker for features without existing markers
      mapFeature.setId();

      const settlement = mapFeature.getSettlement();

      // Get icons from memory for this feature
      imgService.getWeatherIcons([mapFeature]);

      const marker = L.marker(settlement.bounds.getCenter(), {
        icon: mapFeature.getIcon(),
      });

      marker.on("click", () => {
        setWeatherTooltipMapFeature(mapFeature);
      });

      marker.addTo(map);
      mapFeature.setMarker(marker);
      markersCreated++;
    });

    if (markersCreated > 0 || markersUpdated > 0) {
      console.log(`Markers: ${markersCreated} created, ${markersUpdated} updated${markersSkipped > 0 ? ` (${markersSkipped} unchanged)` : ''}`);
    }
  }

  manageMarkerVisibility() {
    const features = this.getMapFeatures();
    let hiddenCount = 0;
    let visibleCount = 0;

    features.forEach((mapFeature) => {
      const marker = mapFeature.getMarker();
      if (!marker) return;

      const settlement = mapFeature.getSettlement();
      const center = settlement.bounds.getCenter();
      const isInViewport = locationService.isCoordinateInViewport(center.lat, center.lng);

      if (isInViewport) {
        if (!marker.getElement()?.style.display || marker.getElement()?.style.display === 'none') {
          marker.getElement()!.style.display = 'block';
          visibleCount++;
        }
      } else {
        if (marker.getElement()?.style.display !== 'none') {
          marker.getElement()!.style.display = 'none';
          hiddenCount++;
        }
      }
    });

    if (hiddenCount > 0 || visibleCount > 0) {
      console.log(`Marker visibility: ${visibleCount} shown, ${hiddenCount} hidden`);
    }
  }

  async autoFetchWeatherForCurrentBounds(
    map: L.Map,
    setWeatherTooltipMapFeature: (feature: MapFeature) => void
  ) {
    if (!locationService.shouldFetchWeather()) {
      this.manageMarkerVisibility(); // Still manage existing markers
      return;
    }

    try {
      // Get settlements in current map bounds
      const settlements = await locationService.getNearbySettlements();

      if (settlements.length > 0) {
        // Fetch weather data for all settlements
        const realtimeWeather = await weatherService.getRealtimeWeatherForSettlements(settlements);
        console.log(`Weather fetched for ${settlements.length} settlements`);

        // Add new features to service (will skip duplicates)
        this.addMany(realtimeWeather);

        // Create markers for new features
        this.createMarkersOnMap(map, setWeatherTooltipMapFeature);
      }

      // Manage visibility of all markers
      this.manageMarkerVisibility();

    } catch (error) {
      console.error("Error in auto weather fetch:", error);
    }
  }
}

export const featureService = FeatureService.getInstance();
