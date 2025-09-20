import { Map } from "@components";
import { PermissionModal } from "@modals";
import { locationService, svgService, weatherService } from "@services";
import { createSignal, onMount } from "solid-js";

export default function Home() {
  const [count, setCount] = createSignal(0);
  const [testIcon, setTestIcon] = createSignal<SVGSVGElement>();
  const [isLoading, setIsLoading] = createSignal(false);

  onMount(async () => {
    const icon = await svgService.lazyLoadWeatherIcon(1000, 0);
    if (!icon) return;
    setTestIcon(icon);
  });

  const handleWeatherFetch = async () => {
    setIsLoading(true);
    try {
      // Get settlements in current map bounds
      const settlements = await locationService.getNearbySettlements();

      if (settlements.length > 0) {
        // Fetch weather data for all settlements
        await weatherService.getRealtimeWeatherForSettlements(settlements);
        console.log(
          `Weather data fetched for ${settlements.length} settlements`,
        );
      } else {
        console.log("No settlements found in current view");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="relative h-screen w-full overflow-hidden">
      {/* Header with controls - positioned to avoid Leaflet zoom controls */}
      <header class="absolute left-16 top-3 z-50 flex items-center gap-4 rounded-lg border border-gray-200 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <div class="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
          <h1 class="text-lg font-semibold tracking-wide text-gray-800">
            Weather Map
          </h1>
        </div>

        <div class="h-6 w-px bg-gray-300"></div>

        <button
          class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          onclick={handleWeatherFetch}
          disabled={isLoading()}
        >
          {isLoading() ? (
            <>
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Fetch Weather</span>
            </>
          )}
        </button>
      </header>

      {/* Permission modal */}
      {!locationService.hasRequested() && (
        <PermissionModal
          onAccept={() => locationService.onAccept()}
          onDecline={() => locationService.onDecline()}
        />
      )}

      {/* Map container */}
      {locationService.hasRequested() && <Map />}
    </div>
  );
}
