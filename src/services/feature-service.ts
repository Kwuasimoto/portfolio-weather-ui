// Feature Cache system

import { MapFeature } from "src/wrappers";

class FeatureService {
  private static instance: FeatureService;
  private readonly mapFeatures: MapFeature[] = [];

  private constructor() {}

  public static getInstance() {
    if (!FeatureService.instance)
      FeatureService.instance = new FeatureService();
    return FeatureService.instance;
  }

  add(feature: object) {
    if (this.isMapFeature(feature)) {
      this.mapFeatures.push(feature);
    }
  }

  addMany(features: object[]) {
    console.log(`Analyzing ${features.length} features`, features);
    for (const feature of features) {
      if (this.isMapFeature(feature)) {
        console.log("Appending Map Feature");
        this.mapFeatures.push(feature);
      }
    }
  }

  getMapFeatures() {
    return this.mapFeatures;
  }

  private readonly isMapFeature = (x: object): x is MapFeature => "map" in x;
}

export const featureService = FeatureService.getInstance();
