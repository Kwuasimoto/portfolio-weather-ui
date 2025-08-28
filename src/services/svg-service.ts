import { Defaults } from "@enums";
import { ContrastConfig, RealtimeWeather } from "@types";
import { SVGContrastBooster } from "@util";
import L from "leaflet";

class SVGService {
  private static instance: SVGService;

  private readonly svgOverlayMap: Map<string, L.SVGOverlay> = new Map();
  private readonly originalBoundsDeltas: Map<string, [number, number]> =
    new Map();

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

  private readonly contrastBooser = new SVGContrastBooster();

  private constructor() {
    this.preloadAllSVGs();
  }

  private preloadAllSVGs() {
    for (const [path, svgModule] of Object.entries(this.svgGlob)) {
      try {
        const svgRaw = svgModule.default;
        const svg = this.parseRawSVGString(svgRaw);

        if (svg) {
          // const boostedSVG = this.contrastBooser.boostSVGContrast(svg);
          // console.log("BoostedSVG", boostedSVG);

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

  public addSVGOverlay(svgOverlay: L.SVGOverlay, svgElement?: SVGElement) {
    const element = svgOverlay.getElement() ?? svgElement;
    if (!element) {
      console.log("No element found on SVGOverlay, can't add to memory");
      return this;
    }
    if (!this.svgOverlayMap.has(element.id))
      this.svgOverlayMap.set(element.id, svgOverlay);
    if (!this.originalBoundsDeltas.has(element.id)) {
      const bounds = svgOverlay.getBounds();
      this.originalBoundsDeltas.set(element.id, [
        bounds.getNorth() - bounds.getSouth(),
        bounds.getEast() - bounds.getWest(),
      ]);
    }
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

  public onZoomEnd(map: L.Map) {
    const currentZoom = map.getZoom();

    const zoomDifference = currentZoom - this.zoomMax;

    const scaleFactor = Math.pow(1.2, -zoomDifference);

    console.log("SCALE FACTOR", scaleFactor);

    for (const [id, svgOverlay] of this.svgOverlayMap.entries()) {
      const deltas = this.originalBoundsDeltas.get(id);
      if (!deltas) continue;

      console.log(`Adjusting bounds for: ${id}`, currentZoom);
      const bounds = svgOverlay.getBounds();
      const [latDiff, lngDiff] = deltas;

      const center = bounds.getCenter();
      const newLatDiff = latDiff * scaleFactor;
      const newLngDiff = lngDiff * scaleFactor;

      const newBounds = L.latLngBounds([
        [center.lat - newLatDiff / 2, center.lng - newLngDiff / 2],
        [center.lat + newLatDiff / 2, center.lng + newLngDiff / 2],
      ]);

      svgOverlay.setBounds(newBounds);
    }
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

  public getWeatherIcon(weatherData: RealtimeWeather) {
    const id = `${weatherData.conditionCode}_${weatherData.isDay}`;

    console.log(this.svgMap);

    if (!this.svgMap.has(id)) {
      throw new Error(`SVG Icon for id ${id} was not preloaded properly.`);
    }

    const svg = this.svgMap.get(id);
    if (!svg) {
      throw new Error(`Preloaded svg for id ${id} is undefined.`);
    }

    return { svg: <SVGSVGElement>svg.cloneNode(true), weatherData };
  }

  public async getWeatherIcons(realtimeWeatherArr: RealtimeWeather[]) {
    return Promise.all(
      realtimeWeatherArr.map((realtimeWeather) =>
        svgService.lazyLoadWeatherIcon(
          realtimeWeather.conditionCode,
          realtimeWeather.isDay,
        ),
      ),
    );
  }

  public createSmallBounds(center: L.LatLng, zoom: number) {
    // create an offset
    const sizeFactor = 0.02;
    const offsetLatFactor = 0.0075;

    const zoomMaxDelta = this.zoomMax - zoom + 1;
    console.log("ZOOM_DELTA", zoomMaxDelta);

    const sizeDegrees = sizeFactor * zoomMaxDelta;
    const offsetLat = offsetLatFactor * zoomMaxDelta;

    console.log("SIZE_DEGREES", sizeDegrees);
    console.log("OFFSET_LAT", offsetLat);

    return L.latLngBounds(
      [center.lat + offsetLat - sizeDegrees / 2, center.lng - sizeDegrees / 2], // NW
      [center.lat + sizeDegrees / 2, center.lng + sizeDegrees / 2], // SE
    );
  }
}

export const svgService = SVGService.getInstance();
