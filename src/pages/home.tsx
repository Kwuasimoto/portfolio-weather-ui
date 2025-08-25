import { Map } from "@components";
import { PermissionModal } from "@modals";
import { locationService } from "@services";
import { createSignal } from "solid-js";
import { Icons, MapIcon } from "@icons";

export default function Home() {
  const [count, setCount] = createSignal(0);

  return (
    <section class="relative">
      <section class="font absolute z-50 px-14 pt-4">
        <text>Kwuasi Map Header</text>
        <button
          class="ml-2 rounded-sm bg-slate-900 px-4 py-2 text-white"
          onclick={async () => await locationService.getNearbyCities()}
        >
          Fetch
        </button>
        <div>{/* <MapIcon iconId={Icons.SUN_CLEAR} /> */}</div>
      </section>

      {!locationService.hasRequested() && (
        <PermissionModal
          onAccept={() => locationService.onAccept()}
          onDecline={() => locationService.onDecline()}
        />
      )}

      <Map />
    </section>
  );
}
