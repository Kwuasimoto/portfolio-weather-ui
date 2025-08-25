export enum ZoomLevel {
  VILLAGE = 15,
  TOWN = 11,
  CITY = 8,
  COUNTRY = 6,
}

class SVGService {
  private static instance: SVGService;

  private readonly SVGViewBoxMappings: Map<
    ZoomLevel,
    L.LatLngBoundsExpression
  > = new Map();
  private readonly SVGCache: Map<string, SVGSVGElement> = new Map();

  private constructor() {}

  static getInstance() {
    if (!SVGService.instance) SVGService.instance = new SVGService();
  }
}

export const svgService = SVGService.getInstance();
