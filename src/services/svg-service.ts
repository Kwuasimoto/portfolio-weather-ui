import { Defaults } from "@enums";
import { SVGContrastBooster } from "@util";
import L from "leaflet";
import { MapFeature } from "src/wrappers";

class SVGService {
  private static instance: SVGService;

  private readonly svgOverlayMap: Map<string, L.SVGOverlay> = new Map();
  private readonly originalCentersMap: Map<string, L.LatLng> = new Map();

  private readonly zoomMax: number = Defaults.ZOOM_MAX;
  private readonly parser: DOMParser = new DOMParser();

  // Could create a massive enum for a more interperable key, but ... yea ...
  private readonly svgMap: Map<string, SVGElement> = new Map();
  private readonly svgGlob = import.meta.glob<
    true,
    string,
    typeof import("?raw")
  >("/src/svgs/*.svg", {
    query: "raw",
    eager: true,
  });

  private constructor() {
    this.preloadAllSVGs();
  }

  private preloadAllSVGs() {
    for (const [path, svgModule] of Object.entries(this.svgGlob)) {
      try {
        const svgRaw = svgModule.default;
        const svg = this.parseRawSVGString(svgRaw);

        if (svg) {
          const filename = path.split("/").pop()?.replace(".svg", "");
          svg.setAttribute("id", filename || "unknown");
          this.setSVG(svg);
        }
      } catch (error) {
        console.error(`Failed to preload SVG: ${path}`, error);
      }
    }
  }

  setSVG(svg: SVGSVGElement) {
    if (!this.svgMap.has(svg.id)) {
      this.svgMap.set(svg.id, svg);
    }
  }

  static getInstance() {
    if (!SVGService.instance) SVGService.instance = new SVGService();
    return SVGService.instance;
  }

  public getSVGOverlay(svgElement: SVGElement) {
    return this.svgOverlayMap.get(svgElement.id);
  }

  public addSVGOverlay(mapFeature: MapFeature) {
    const element = mapFeature.getSVG();
    const settlement = mapFeature.getSettlement();

    const id = `${settlement.name.toLocaleLowerCase()}_${element.id}`;

    if (!this.svgOverlayMap.has(id))
      this.svgOverlayMap.set(id, mapFeature.getSVGOverlay());

    return this;
  }

  public delSVGOverlay(map: L.Map, svgElement: SVGElement) {
    const layer = this.getSVGOverlay(svgElement);
    if (!layer) return false;
    return map.removeLayer(layer);
  }

  public delSVGOverlayElement(svgOverlay: L.SVGOverlay) {
    const element = svgOverlay.getElement();
    if (!element) {
      console.error(
        "SVG layer lost its associated element, failed to remove from memory! (URGENT FIX REQUIRED.)",
      );
      return this;
    }
    this.svgOverlayMap.delete(element.id);
    return this;
  }

  private parseRawSVGString(data: string | typeof import("?raw")) {
    try {
      const svgRaw = typeof data === "string" ? data : data.default;
      const doc = this.parser.parseFromString(svgRaw, "image/svg+xml");
      const svg = doc.querySelector("svg");

      if (!svg) {
        throw new Error("querySelect('svg'); return undefined");
      }
      svg.setAttribute("viewBox", "0 0 512 512");

      return svg;
    } catch (error) {
      console.error("Failed to parse svg image", error);
    }
  }

  /**
   * Lazy loads icons using non-eager module loading and saves parsed svg to memory for re-use.
   * @param code
   * @param isDay
   * @returns
   */
  public async lazyLoadWeatherIcon(code: number, isDay: number) {
    const path = `/src/svgs/${code}_${isDay}.svg`;
    if (!this.svgMap.has(path)) {
      const svgModule = this.svgGlob[path];
      if (!svgModule) throw new Error(`svgLoader not found: ${path}`);

      const svgRaw = svgModule.default;
      const svg = this.parseRawSVGString(svgRaw);

      if (!svg)
        throw new Error(
          `Failed to parse icon from module: \n[path:${path}]\n[icon:${svgRaw}]`,
        );

      svg.setAttribute("id", `${code}_${isDay}`);
      console.log("Appending new weather SVG to memory", svg.id);

      this.svgMap.set(path, svg);
      return svg;
    }

    console.log("Cloning existing SVG");
    return <SVGSVGElement>this.svgMap.get(path)!.cloneNode(true);
  }

  public getWeatherIcon(mapFeature: MapFeature) {
    const weather = mapFeature.getWeather();

    const id = `${weather.conditionCode}_${weather.isDay}`;

    if (!this.svgMap.has(id)) {
      throw new Error(`SVG Icon for id ${id} was not preloaded properly.`);
    }

    const svg = this.svgMap.get(id);
    if (!svg) {
      throw new Error(`Preloaded svg for id ${id} is undefined.`);
    }
    const clone = <SVGSVGElement>svg.cloneNode(true);
    mapFeature.setSVG(clone);
    return mapFeature;
  }

  public getWeatherIcons(mapFeatures: MapFeature[]) {
    return mapFeatures.map((mapFeature) =>
      svgService.getWeatherIcon(mapFeature),
    );
  }

  public onZoomEnd(map: L.Map) {
    const zoom = map.getZoom();

    const sizeFactor = 0.02;
    const offsetLatFactor = 0.01;

    const zoomDelta = this.zoomMax - zoom + 1;

    const size = sizeFactor * zoomDelta ** 1.2;
    const northOffset = offsetLatFactor * (zoomDelta - 0.1) ** 1.175;

    for (const [id, svgOverlay] of this.svgOverlayMap.entries()) {
      const initialBounds = this.originalCentersMap.get(id);

      if (!initialBounds) {
        console.error("Failed to find initial bounds", svgOverlay);
        return;
      }

      const bounds = L.latLngBounds(
        [
          initialBounds.lat + northOffset - size / 2,
          initialBounds.lng - size / 2,
        ], // NW
        [initialBounds.lat + size / 2, initialBounds.lng + size / 2], // SE
      );

      svgOverlay.setBounds(bounds);
    }
  }

  public createInitialBounds(mapFeature: MapFeature) {
    const settlement = mapFeature.getSettlement();
    const zoom = mapFeature.getMap().getZoom();

    const center = settlement.bounds.getCenter();
    this.originalCentersMap.set(mapFeature.getId(), center);

    // create an offset
    const sizeFactor = 0.02;
    const offsetLatFactor = 0.01;

    const zoomDelta = this.zoomMax - zoom + 1;

    const size = sizeFactor * zoomDelta ** 1.2;
    const northOffset = offsetLatFactor * (zoomDelta - 0.1) ** 1.175;

    const bounds = L.latLngBounds(
      [center.lat + northOffset - size / 2, center.lng - size / 2], // NW
      [center.lat + size / 2, center.lng + size / 2], // SE
    );

    return bounds;
  }
}

export const svgService = SVGService.getInstance();
