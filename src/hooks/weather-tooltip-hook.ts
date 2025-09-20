import { createSignal } from "solid-js";
import { MapFeature } from "src/wrappers";

const [getWeatherTooltipMapFeature, setToggledMapFeature] = createSignal<
  MapFeature | undefined
>();

// Is this needed?
export const useWeatherTooltip = () => {
  const setWeatherTooltipMapFeature = (mapFeature: MapFeature) =>
    setToggledMapFeature(mapFeature);

  return {
    getWeatherTooltipMapFeature,
    setWeatherTooltipMapFeature,
  };
};
