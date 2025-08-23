import { createSignal, Signal } from "solid-js";

// For loading states and other important app states.
class AppService {
  private static instance: AppService;
  private readonly mapLoading: Signal<boolean> = createSignal(false);

  static getInstance() {
    if (!AppService.instance) {
      AppService.instance = new AppService();
    }
    return AppService.instance;
  }

  isMapLoading() {
    return this.mapLoading[0]();
  }

  setMapLoading(state: boolean) {
    this.mapLoading[1](state);
  }
}

export const appService = AppService.getInstance();
