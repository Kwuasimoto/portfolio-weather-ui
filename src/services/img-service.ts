import { MapFeature } from "src/wrappers";

import L from "leaflet";

export class ImgService {
  //   private readonly imgUrl: string = "cdn.weatherapi.com/weather/64x64/";

  private static instance: ImgService;

  private constructor() {}

  static getInstance() {
    if (!ImgService.instance) ImgService.instance = new ImgService();
    return ImgService.instance;
  }

  getWeatherIcon(mapFeature: MapFeature) {
    const weather = mapFeature.getWeather();
    return L.icon({
      iconUrl: weather.icon,
      iconSize: [64, 64],
      iconAnchor: [32, 64],
      popupAnchor: [0, -64],
    });
  }

  getWeatherIcons(mapFeatures: MapFeature[]) {
    return mapFeatures.map((mapFeature) => {
      mapFeature.setIcon(this.getWeatherIcon(mapFeature));
      return mapFeature;
    });
  }
}

export const imgService = ImgService.getInstance();
