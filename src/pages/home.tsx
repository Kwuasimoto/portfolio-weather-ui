import { Map } from "@components";
import { PermissionModal } from "@modals";
import { locationService, svgService } from "@services";
import { createSignal, onMount } from "solid-js";

export default function Home() {
  const [count, setCount] = createSignal(0);
  const [testIcon, setTestIcon] = createSignal<SVGSVGElement>();

  onMount(async () => {
    const icon = await svgService.lazyLoadWeatherIcon(1000, 0);
    if (!icon) return;
    setTestIcon(icon);
  });

  return (
    <section class="relative">
      <section class="font absolute z-50 px-14 pt-4">
        <text>Kwuasi Map Header</text>
        <button
          class="ml-2 rounded-sm bg-slate-900 px-4 py-2 text-white"
          onclick={async () => await locationService.getNearbySettlements()}
        >
          Fetch
        </button>
        {/* <div>{testIcon()}</div> */}
      </section>

      {!locationService.hasRequested() && (
        <PermissionModal
          onAccept={() => locationService.onAccept()}
          onDecline={() => locationService.onDecline()}
        />
      )}

      {locationService.hasRequested() && <Map />}
    </section>
  );
}
