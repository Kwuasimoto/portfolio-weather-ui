import L from "leaflet";
import { createSignal, Signal } from "solid-js";

class MapService {
  private map: Signal<L.Map | undefined> = createSignal();

  private static instance: MapService;

  private constructor() {}

  public static getInstance() {
    if (!MapService.instance) MapService.instance = new MapService();
    return MapService.instance;
  }

  public setMap(map: L.Map) {
    this.map[1](map);
  }

  public getMap() {
    return this.map[0]();
  }
}

export const mapService = MapService.getInstance();
