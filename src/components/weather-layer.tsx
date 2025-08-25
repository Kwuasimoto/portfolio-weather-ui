import {
  Component,
  createResource,
  createRoot,
  JSX,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import L from "leaflet";
import { LatLng, WeatherData } from "@types";
import { render } from "solid-js/web";

export enum Icons {
  SUN_CLEAR = "sun_clear",
}

const iconCache = new Map<Icons, () => string | undefined>();

const loadIcon = async (iconId: Icons): Promise<string> => {
  try {
    const module = await import(`./images/${iconId}.svg`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load icon: ${iconId}`, error);
    throw error;
  }
};

const getIconResource = (iconId: Icons) => {
  if (!iconCache.has(iconId)) {
    createRoot(() => {
      const [iconSrc] = createResource(() => iconId, loadIcon);
      iconCache.set(iconId, iconSrc);
    });
  }
  return iconCache.get(iconId);
};

export interface IconProps {
  iconId: Icons;
  alt?: string;
  cls?: string;
  size?: number;
  onClick?: (event: MouseEvent) => void;
  onHover?: (isHovered: boolean) => void;
  imgProps?: Omit<JSX.DOMAttributes<HTMLImageElement>, "src">;
}

export const MapIcon: Component<IconProps> = (props) => {
  const iconSrc = getIconResource(props.iconId);
  const size = props.size;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    props.onClick?.(e);
  };

  const handleMouseEnter = (e: MouseEvent) => {
    e.stopPropagation();
    props.onHover?.(true);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    props.onHover?.(false);
  };

  return (
    <Show
      when={iconSrc?.()}
      fallback={<div class="rounded-sm bg-red-800 px-4 py-2">!Icon</div>}
    >
      <img
        src={iconSrc!()}
        alt={props.iconId}
        class={`weather-map-icon ${props.imgProps?.class || ""}`}
        style={`
          width: ${size}px; 
          height: ${size}px; 
          cursor: pointer;
          pointer-events: auto;
          user-select: none;
          transition: transform 0.15s ease;
        `}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
        draggable={false}
      />
    </Show>
  );
};
