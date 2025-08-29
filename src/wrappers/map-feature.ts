import { RealtimeWeather, Settlement } from "@types";
import L from "leaflet";

/**
 * DATACLASS.
 */
export class MapFeature {
  private id!: string;
  private svg!: SVGSVGElement;
  private svgOverlay!: L.SVGOverlay;
  private weather!: RealtimeWeather;
  private settlement!: Settlement;
  private map!: L.Map;

  constructor() {}

  getSVG() {
    return this.svg;
  }

  getSVGOverlay() {
    return this.svgOverlay;
  }

  getWeather() {
    return this.weather;
  }

  getSettlement() {
    return this.settlement;
  }

  getMap() {
    return this.map;
  }

  getId() {
    return this.id;
  }

  setSVG(svg: SVGSVGElement) {
    this.svg = svg;
  }

  setSVGOverlay(svgOverlay: L.SVGOverlay) {
    this.svgOverlay = svgOverlay;
  }

  setWeather(weather: RealtimeWeather) {
    this.weather = weather;
  }

  setSettlement(location: Settlement) {
    this.settlement = location;
  }

  setMap(map: L.Map): void {
    this.map = map;
  }

  /**
   * Creates ID based on weather icon code, and settlement name.
   */
  setId() {
    return `${this.settlement.name}_${this.weather.conditionCode}_${this.weather.isDay}`;
  }

  json() {
    return {
      svg: this.svg,
      svgOverlay: this.svgOverlay,
      weather: this.weather,
      settlement: this.settlement,
    };
  }
}
