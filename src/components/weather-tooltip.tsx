import { useWeatherTooltip } from "@hooks";
import { RealtimeWeather, Settlement } from "@types";
import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  JSX,
  onMount,
  Show,
} from "solid-js";
import { imgService } from "src/services/img-service";
import { Thermometer } from "lucide-solid";

interface WeatherTooltipData {
  location: string;
  temperature: number;
  condition: string;
  feelsLike: number;
  windSpeed: number;
  humidity: number;
}

interface WeatherTooltipProps {
  children: JSX.Element;
  data: WeatherTooltipData;
}

export type TemperatureUnits = "F" | "C";
export type WindSpeedUnits = "mph" | "kmh";

export const WeatherTooltip: Component = () => {
  const { getWeatherTooltipMapFeature } = useWeatherTooltip();
  const [weatherData, setWeatherData] = createSignal<RealtimeWeather>();
  const [settlementData, setSettlementData] = createSignal<Settlement>();

  createEffect(() => {
    const mapFeature = getWeatherTooltipMapFeature();
    if (mapFeature) {
      setWeatherData(mapFeature.getWeather());
      setSettlementData(mapFeature.getSettlement());
    }
  });

  const [tempUnit, setTempUnit] = createSignal<TemperatureUnits>("F");
  const [windUnit, setWindUnit] = createSignal<WindSpeedUnits>("mph");

  const getTemp = (
    weatherData: Accessor<RealtimeWeather | undefined>,
    tempUnit: Accessor<TemperatureUnits>,
  ) => {
    const data = weatherData();
    const unit = tempUnit();
    return unit === "C" ? data?.tempC : data?.tempF;
  };

  const getFeelsLikeTemp = (
    weatherData: Accessor<RealtimeWeather | undefined>,
    tempUnit: Accessor<TemperatureUnits>,
  ) => {
    const data = weatherData();
    const unit = tempUnit();
    return unit === "C" ? data?.windChillC : data?.windChillF;
  };

  const getWind = (
    weatherData: Accessor<RealtimeWeather | undefined>,
    speedUnit: Accessor<WindSpeedUnits>,
  ) => {
    const data = weatherData();
    const speed = speedUnit();
    return speed === "mph" ? data?.windMPH : data?.windKPH;
  };

  const toggleTempUnit = () => {
    setTempUnit((prev) => (prev === "F" ? "C" : "F"));
  };

  const toggleWindUnit = () => {
    setWindUnit((prev) => (prev === "mph" ? "kmh" : "mph"));
  };

  return (
    <div class="fixed right-4 top-4 z-50">
      <Show when={getWeatherTooltipMapFeature()}>
        <div class="weather-tooltip bg-card shadow-weather w-80 rounded-lg border-2">
          <div class="space-y-3 p-4">
            {/* Header with location and unit toggles */}
            <div class="flex items-center justify-between">
              <h3 class="text-card-foreground text-base font-semibold">
                {settlementData()?.name}
              </h3>
              <div class="flex gap-1">
                <button
                  onClick={toggleTempUnit}
                  class="unit-toggle cursor-pointer"
                >
                  °{tempUnit()}
                </button>
                <button
                  onClick={toggleWindUnit}
                  class="unit-toggle cursor-pointer"
                >
                  {windUnit()}
                </button>
              </div>
            </div>

            {/* Main temperature and condition */}
            <div class="flex items-center justify-between">
              <div class="flex w-full items-center gap-3">
                <img src={weatherData()?.icon} />
                <span class="text-muted-foreground pr-2 text-sm font-medium">
                  {weatherData()?.condition}
                </span>
              </div>
              <div class="text-right">
                <div class="text-primary text-3xl font-bold">
                  {getTemp(weatherData, tempUnit)}°
                </div>
              </div>
            </div>

            {/* Weather details grid */}
            <div class="weather-data-grid border-border border-t pt-4">
              <div class="flex items-center gap-2">
                <img
                  src={
                    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRoZXJtb21ldGVyLWljb24gbHVjaWRlLXRoZXJtb21ldGVyIj48cGF0aCBkPSJNMTQgNHYxMC41NGE0IDQgMCAxIDEtNCAwVjRhMiAyIDAgMCAxIDQgMFoiLz48L3N2Zz4="
                  }
                  class="text-muted-foreground h-4 w-4"
                />
                <div>
                  <div class="text-muted-foreground text-xs">Feels like</div>
                  <div class="text-sm font-medium">
                    {getFeelsLikeTemp(weatherData, tempUnit)}°
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXdpbmQtaWNvbiBsdWNpZGUtd2luZCI+PHBhdGggZD0iTTEyLjggMTkuNkEyIDIgMCAxIDAgMTQgMTZIMiIvPjxwYXRoIGQ9Ik0xNy41IDhhMi41IDIuNSAwIDEgMSAyIDRIMiIvPjxwYXRoIGQ9Ik05LjggNC40QTIgMiAwIDEgMSAxMSA4SDIiLz48L3N2Zz4="
                  class="text-muted-foreground h-4 w-4"
                />
                <div>
                  <div class="text-muted-foreground text-xs">Wind</div>
                  <div class="text-sm font-medium">
                    {getWind(weatherData, windUnit)} {windUnit()}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWRyb3BsZXRzLWljb24gbHVjaWRlLWRyb3BsZXRzIj48cGF0aCBkPSJNNyAxNi4zYzIuMiAwIDQtMS44MyA0LTQuMDUgMC0xLjE2LS41Ny0yLjI2LTEuNzEtMy4xOVM3LjI5IDYuNzUgNyA1LjNjLS4yOSAxLjQ1LTEuMTQgMi44NC0yLjI5IDMuNzZTMyAxMS4xIDMgMTIuMjVjMCAyLjIyIDEuOCA0LjA1IDQgNC4wNXoiLz48cGF0aCBkPSJNMTIuNTYgNi42QTEwLjk3IDEwLjk3IDAgMCAwIDE0IDMuMDJjLjUgMi41IDIgNC45IDQgNi41czMgMy41IDMgNS41YTYuOTggNi45OCAwIDAgMS0xMS45MSA0Ljk3Ii8+PC9zdmc+"
                  class="text-muted-foreground h-4 w-4"
                />
                <div>
                  <div class="text-muted-foreground text-xs">Humidity</div>
                  <div class="text-sm font-medium">
                    {weatherData()?.humidity}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};
