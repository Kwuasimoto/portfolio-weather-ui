import { RealtimeWeather, Settlement } from "@types";
import L from "leaflet";

/**
 * DATACLASS.
 */
export class MapFeature {
  private id!: string;
  private weather!: RealtimeWeather;
  private settlement!: Settlement;

  private svg!: SVGSVGElement;
  private svgOverlay!: L.SVGOverlay;
  private map!: L.Map;
  private icon!: L.Icon<L.IconOptions>;

  constructor() {}

  getIcon() {
    return this.icon;
  }

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

  setIcon(icon: L.Icon<L.IconOptions>) {
    this.icon = icon;
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
    const settlementNameNormalized = this.settlement.name
      .toLowerCase()
      .split(" ")
      .join("_");
    this.id = `${settlementNameNormalized}_${this.weather.conditionCode}_${this.weather.isDay}`;
  }

  json() {
    return {
      id: this.getId(),
      svg: this.svg,
      svgOverlay: this.svgOverlay,
      weather: this.weather,
      settlement: this.settlement,
      icon: this.icon,
    };
  }
}
