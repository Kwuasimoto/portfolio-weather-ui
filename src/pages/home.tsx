import { Map } from "@components";
import { PermissionModal } from "@modals";
import { locationService } from "@services";
import { createSignal } from "solid-js";

export default function Home() {
  const [count, setCount] = createSignal(0);

  return (
    <section class="relative">
      <section class="font absolute z-50 px-14 pt-4">Kwuasi Map Header</section>

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
