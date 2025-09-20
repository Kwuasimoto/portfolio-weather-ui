import { useWeatherTooltip } from "@hooks";
import { RealtimeWeather, Settlement } from "@types";
import { Directions } from "@enums";
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

  const formatLastUpdated = (lastUpdatedEpoch: number | undefined) => {
    if (!lastUpdatedEpoch) return "Unknown";
    const date = new Date(lastUpdatedEpoch * 1000); // Convert epoch seconds to milliseconds
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDewPoint = (
    weatherData: Accessor<RealtimeWeather | undefined>,
    tempUnit: Accessor<TemperatureUnits>,
  ) => {
    const data = weatherData();
    const unit = tempUnit();
    return unit === "C" ? data?.dewpointC : data?.dewpointF;
  };

  const getHeatIndex = (
    weatherData: Accessor<RealtimeWeather | undefined>,
    tempUnit: Accessor<TemperatureUnits>,
  ) => {
    const data = weatherData();
    const unit = tempUnit();
    return unit === "C" ? data?.heatIndexC : data?.heatIndexF;
  };

  return (
    <div class="fixed right-4 top-4 z-50">
      <Show when={getWeatherTooltipMapFeature()}>
        <div class="weather-tooltip w-80 rounded-lg border-2 bg-card shadow-weather">
          <div class="space-y-3 p-4">
            {/* Header with location and unit toggles */}
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-card-foreground">
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
                <img
                  src={weatherData()?.icon}
                  alt="Weather icon"
                  class="h-12 w-12"
                />
                <div>
                  <span class="block text-sm font-medium text-muted-foreground">
                    {weatherData()?.condition}
                  </span>
                  <span class="text-xs text-muted-foreground">
                    Updated: {formatLastUpdated(weatherData()?.lastUpdatedEpoch)}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-primary">
                  {getTemp(weatherData, tempUnit)}°
                </div>
              </div>
            </div>

            {/* Temperature section */}
            <div class="border-t border-border pt-3">
              <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Temperature
              </h4>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <img
                    src={
                      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRoZXJtb21ldGVyLWljb24gbHVjaWRlLXRoZXJtb21ldGVyIj48cGF0aCBkPSJNMTQgNHYxMC41NGE0IDQgMCAxIDEtNCAwVjRhMiAyIDAgMCAxIDQgMFoiLz48L3N2Zz4="
                    }
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <div>
                    <div class="text-xs text-muted-foreground">Feels like</div>
                    <div class="text-sm font-medium">
                      {getFeelsLikeTemp(weatherData, tempUnit)}°
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiLz48cGF0aCBkPSJtMTIgMiA3IDEwLTcgMTB2LTZ2LTh2LTZ6Ii8+PHBhdGggZD0iTTEyIDkuNWE0IDQgMCAxIDEgMCA4IDQgNCAwIDAgMS0wLTh6Ii8+PC9zdmc+"
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <div>
                    <div class="text-xs text-muted-foreground">Heat Index</div>
                    <div class="text-sm font-medium">
                      {getHeatIndex(weatherData, tempUnit)}°
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wind section */}
            <div class="border-t border-border pt-3">
              <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Wind
              </h4>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXdpbmQtaWNvbiBsdWNpZGUtd2luZCI+PHBhdGggZD0iTTEyLjggMTkuNkEyIDIgMCAxIDAgMTQgMTZIMiIvPjxwYXRoIGQ9Ik0xNy41IDhhMi41IDIuNSAwIDEgMSAyIDRIMiIvPjxwYXRoIGQ9Ik05LjggNC40QTIgMiAwIDEgMSAxMSA4SDIiLz48L3N2Zz4="
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <div>
                    <div class="text-xs text-muted-foreground">Speed</div>
                    <div class="text-sm font-medium">
                      {getWind(weatherData, windUnit)} {windUnit()}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBvbHlsaW5lIHBvaW50cz0iMTIsMTYgMTYsMTIgMTIsOCIvPjwvc3ZnPg=="
                    class="h-4 w-4 text-muted-foreground transition-transform duration-300"
                    style={`transform: rotate(${(weatherData()?.windDegree || 0) - 90}deg)`}
                  />
                  <div>
                    <div class="text-xs text-muted-foreground">Direction</div>
                    <div class="flex items-center text-sm font-medium">
                      {weatherData()?.windDir}
                      <span class="pl-2 text-xs text-muted-foreground">
                        {weatherData()?.windDegree}°
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Atmospheric section */}
            <div class="border-t border-border pt-3">
              <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Conditions
              </h4>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWRyb3BsZXRzLWljb24gbHVjaWRlLWRyb3BsZXRzIj48cGF0aCBkPSJNNyAxNi4zYzIuMiAwIDQtMS44MyA0LTQuMDUgMC0xLjE2LS41Ny0yLjI2LTEuNzEtMy4xOVM3LjI5IDYuNzUgNyA1LjNjLS4yOSAxLjQ1LTEuMTQgMi44NC0yLjI5IDMuNzZTMyAxMS4xIDMgMTIuMjVjMCAyLjIyIDEuOCA0LjA1IDQgNC4wNXoiLz48cGF0aCBkPSJNMTIuNTYgNi42QTEwLjk3IDEwLjk3IDAgMCAwIDE0IDMuMDJjLjUgMi41IDIgNC45IDQgNi5zIDMgMy41IDMgNS1hNi45OCA2Ljk4IDAgMCAxLTExLjkxIDQuOTciLz48L3N2Zz4="
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <div>
                    <div class="text-xs text-muted-foreground">Humidity</div>
                    <div class="text-sm font-medium">
                      {weatherData()?.humidity}%
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiLz48cGF0aCBkPSJtMTIgMiA3IDEwLTcgMTB2LTZ2LTh2LTZ6Ii8+PC9zdmc+"
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <div>
                    <div class="text-xs text-muted-foreground">UV Index</div>
                    <div class="text-sm font-medium">
                      {weatherData()?.uv}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNCA0djEwLjU0YTQgNCAwIDEgMS00IDBWNGEyIDIgMCAwIDEgNCAwWiIvPjxwYXRoIGQ9Im0xNC0yIDAtNHYyaDJoLTJ6Ii8+PC9zdmc+"
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <div>
                    <div class="text-xs text-muted-foreground">Dew Point</div>
                    <div class="text-sm font-medium">
                      {getDewPoint(weatherData, tempUnit)}°
                    </div>
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
