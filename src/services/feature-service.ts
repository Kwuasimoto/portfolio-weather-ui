// Feature Cache system

import { State } from "@types";
import { createStore } from "solid-js/store";
import { MapFeature } from "src/wrappers";
import L from "leaflet";
import { imgService } from "./img-service";
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
      console.log(
        "Existing feature detected, ignoring.",
        feature.getSettlement(),
      );
      return;
    }

    console.log("Adding new feature");
    this.mapFeatures[1]((prev) => [...prev, feature]);
  }

  addMany(features: MapFeature[]) {
    console.log(`Analyzing ${features.length} features`, features);
    const newFeatures: MapFeature[] = [];
    for (const feature of features) {
      const exists = this.mapFeatures[0].some((f) =>
        equal(f.getSettlement(), feature.getSettlement()),
      );
      if (exists) {
        console.log("Existing feature detected, ignoring.");
        continue;
      }
      newFeatures.push(feature);
    }
    if (newFeatures.length <= 0) {
      console.log("No new features detected, not re-rendering");
      return;
    }
    console.log(
      `Adding ${newFeatures.length} new features to map, triggering re-render`,
    );
    this.mapFeatures[1]((prev) => [...prev, ...newFeatures]);
  }

  getMapFeatures() {
    return this.mapFeatures[0];
  }

  createMarkersOnMap(
    map: L.Map,
    setWeatherTooltipMapFeature: (feature: MapFeature) => void,
  ) {
    const features = this.getMapFeatures();

    features.forEach((mapFeature) => {
      if (mapFeature.getMarker()) {
        console.log("Marker detected, bypassing creation");
        return;
      }

      // mapFeature should be populated with enough information at this point to set its internal ID.
      mapFeature.setId();

      const settlement = mapFeature.getSettlement();

      // Get icons from memory for this feature
      imgService.getWeatherIcons([mapFeature]);

      const marker = L.marker(settlement.bounds.getCenter(), {
        icon: mapFeature.getIcon(),
      });

      marker.on("click", () => {
        setWeatherTooltipMapFeature(mapFeature);
        console.log("Tooltip state set for:", mapFeature.getSettlement().name);
      });

      marker.addTo(map);

      mapFeature.setMarker(marker);
      console.log("Successfully added feature", mapFeature.json());
    });
  }
}

export const featureService = FeatureService.getInstance();
