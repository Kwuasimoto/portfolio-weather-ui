import { ContrastConfig } from "@types";

type ColorMappings = {
  [key: string]: string;
};

export class SVGContrastBooster {
  private readonly defaultConfig: ContrastConfig = {
    addDropShadow: true,
    addWhiteOutline: false, // Usually one or the other
    boostColors: true,
    shadowIntensity: 0.2,
    outlineWidth: 10,
  };

  private readonly colorMappings: ColorMappings = {
    // Light/muted colors -> Brighter/whiter
    // "#f3f7fe": "#ffffff",
    // "#f0f8ff": "#ffffff",
    // "#deeafb": "#e1f1ff",
    // "#e6effc": "#ffffff",
    // Gray colors -> Higher contrast grays or white
    // "#9ca3af": "#ffffff",
    // "#6b7280": "#2d3748",
    // "#848b98": "#1a202c",
    // Blue tones -> More vibrant blues or gold for sun
    // "#86c3db": "#ffd700", // Sun elements to gold
    // "#5eafcf": "#ffa500", // Sun elements to orange
    // "#72b9d5": "#ff8c00", // Sun stroke to darker orange
  };

  /**
   * Main function to boost contrast of an SVG element
   */
  public boostSVGContrast(
    svgElement: SVGSVGElement,
    config?: Partial<ContrastConfig>,
  ): SVGSVGElement {
    const finalConfig = { ...this.defaultConfig, ...config };
    const clonedSVG = svgElement.cloneNode(true) as SVGSVGElement;

    // Step 1: Add filters for shadows/outlines
    this.addContrastFilters(clonedSVG, finalConfig);

    // Step 2: Boost colors in gradients and fills
    if (finalConfig.boostColors) {
      this.boostColors(clonedSVG);
    }

    // Step 3: Apply filters to main elements
    this.applyFiltersToElements(clonedSVG, finalConfig);

    return clonedSVG;
  }

  /**
   * Add filter definitions to SVG
   */
  private addContrastFilters(
    svgElement: SVGSVGElement,
    config: ContrastConfig,
  ): void {
    let defs = svgElement.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      svgElement.insertBefore(defs, svgElement.firstChild);
    }

    // Drop shadow filter
    if (config.addDropShadow) {
      const shadowFilter = this.createDropShadowFilter(config.shadowIntensity);
      defs.appendChild(shadowFilter);
    }

    // White outline filter
    if (config.addWhiteOutline) {
      const outlineFilter = this.createOutlineFilter(config.outlineWidth);
      defs.appendChild(outlineFilter);
    }
  }

  /**
   * Create drop shadow filter
   */
  private createDropShadowFilter(intensity: number): SVGFilterElement {
    const filter = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "filter",
    );
    filter.setAttribute("id", "contrast-dropshadow");
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");

    const dropShadow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feDropShadow",
    );
    dropShadow.setAttribute("dx", "2");
    dropShadow.setAttribute("dy", "2");
    dropShadow.setAttribute("stdDeviation", "3");
    dropShadow.setAttribute("flood-color", `rgba(0,0,0,${intensity})`);

    filter.appendChild(dropShadow);
    return filter;
  }

  /**
   * Create white outline filter
   */
  private createOutlineFilter(width: number): SVGFilterElement {
    const filter = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "filter",
    );
    filter.setAttribute("id", "contrast-outline");
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");

    // Dilate to create outline
    const morphology = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feMorphology",
    );
    morphology.setAttribute("operator", "dilate");
    morphology.setAttribute("radius", width.toString());
    morphology.setAttribute("result", "outline");

    // Flood with white
    const flood = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feFlood",
    );
    flood.setAttribute("flood-color", "white");
    flood.setAttribute("result", "white");

    // Composite original over outline
    const composite1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feComposite",
    );
    composite1.setAttribute("operator", "in");
    composite1.setAttribute("in", "white");
    composite1.setAttribute("in2", "outline");
    composite1.setAttribute("result", "whiteOutline");

    const composite2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feComposite",
    );
    composite2.setAttribute("operator", "over");
    composite2.setAttribute("in", "SourceGraphic");
    composite2.setAttribute("in2", "whiteOutline");

    filter.appendChild(morphology);
    filter.appendChild(flood);
    filter.appendChild(composite1);
    filter.appendChild(composite2);
    return filter;
  }

  /**
   * Boost colors in gradients and direct fills/strokes
   */
  private boostColors(svgElement: SVGSVGElement): void {
    // Update gradients
    const linearGradients = svgElement.querySelectorAll("linearGradient");
    linearGradients.forEach((gradient) => {
      const stops = gradient.querySelectorAll("stop");
      stops.forEach((stop) => {
        const stopColor = stop.getAttribute("stop-color");
        if (stopColor && this.colorMappings[stopColor]) {
          stop.setAttribute("stop-color", this.colorMappings[stopColor]);
        }
      });
    });

    // Update direct fills and strokes
    const allElements = svgElement.querySelectorAll("*");
    allElements.forEach((element) => {
      // Update fill colors
      const fill = element.getAttribute("fill");
      if (fill && this.colorMappings[fill]) {
        element.setAttribute("fill", this.colorMappings[fill]);
      }

      // Update stroke colors
      const stroke = element.getAttribute("stroke");
      if (stroke && this.colorMappings[stroke]) {
        element.setAttribute("stroke", this.colorMappings[stroke]);
      }
    });
  }

  /**
   * Apply filters to main visual elements
   */
  private applyFiltersToElements(
    svgElement: SVGSVGElement,
    config: ContrastConfig,
  ): void {
    // Find main content elements (usually <use> elements or direct shapes)
    const mainElements = svgElement.querySelectorAll(
      "use, path, circle, rect, polygon",
    );

    if (mainElements.length === 0) {
      // If no main elements found, apply to the entire SVG content
      const rootGroup = svgElement.querySelector("g") || svgElement;
      this.applyFilter(rootGroup as SVGElement, config);
      return;
    }

    // Apply to main elements
    mainElements.forEach((element) => {
      this.applyFilter(element as SVGElement, config);
    });
  }

  /**
   * Apply the appropriate filter to an element
   */
  private applyFilter(element: SVGElement, config: ContrastConfig): void {
    let filterUrl = "";

    if (config.addDropShadow) {
      filterUrl = "url(#contrast-dropshadow)";
    } else if (config.addWhiteOutline) {
      filterUrl = "url(#contrast-outline)";
    }

    if (filterUrl) {
      element.setAttribute("filter", filterUrl);
    }
  }

  /**
   * Smart contrast detection - analyzes SVG to determine best approach
   */
  public getOptimalContrastConfig(svgElement: SVGSVGElement): ContrastConfig {
    const hasAnimation = svgElement.querySelector("animateTransform") !== null;
    const hasComplexGradients =
      svgElement.querySelectorAll("linearGradient").length > 2;

    // For complex animated SVGs, prefer drop shadow over outline
    if (hasAnimation || hasComplexGradients) {
      return {
        addDropShadow: true,
        addWhiteOutline: false,
        boostColors: true,
        shadowIntensity: 0.8,
        outlineWidth: 2,
      };
    }

    // For simpler SVGs, outline might work better
    return {
      addDropShadow: false,
      addWhiteOutline: true,
      boostColors: true,
      shadowIntensity: 0.7,
      outlineWidth: 1.5,
    };
  }
}
