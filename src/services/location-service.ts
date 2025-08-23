import { appService } from "@services";
import { LocationPermission, MapBounds, State } from "@types";
import { createStore } from "solid-js/store";

class LocationService {
  private static instance: LocationService;
  private readonly perms: State<LocationPermission>;
  private readonly bounds: State<MapBounds>;

  constructor() {
    this.perms = createStore<LocationPermission>({
      granted: false,
      requested: false,
    });
    this.bounds = createStore<MapBounds>({
      north: 44.0,
      south: 43.5,
      east: -79.0,
      west: -80.0,
      zoom: 13,
    });
  }

  static getInstance() {
    if (!LocationService.instance)
      LocationService.instance = new LocationService();
    return LocationService.instance;
  }

  onAccept(cb?: (state: boolean) => void) {
    try {
      appService.setMapLoading(true);
      navigator.geolocation.getCurrentPosition((loc) => {
        this.onGeoLocSuccess(loc);
        if (cb) cb(true);
      }, this.onGeoLocError);
    } catch (e) {
      console.error("Unknown error occured fetching geolocation position", e);
      appService.setMapLoading(false);
      this.perms[1](() => ({ granted: true, requested: true }));
    }
  }

  onDecline(cb?: (state: boolean) => void) {
    this.perms[1](() => ({ granted: false, requested: true }));
    if (cb) cb(this.perms[0].granted);
  }

  isGranted() {
    return this.perms[0].granted;
  }

  hasRequested() {
    return this.perms[0].requested;
  }

  getBounds() {
    return this.bounds[0];
  }

  private readonly onGeoLocSuccess = (geoLoc: GeolocationPosition) => {
    console.log("Successfully fetched geolocation", geoLoc);
    this.bounds[1]((prev) => ({
      ...prev,
      north: geoLoc.coords.latitude + 0.25,
      south: geoLoc.coords.latitude - 0.25,
      east: geoLoc.coords.longitude + 0.25,
      west: geoLoc.coords.longitude - 0.25,
    }));
    appService.setMapLoading(false);
    this.perms[1](() => ({ granted: true, requested: true }));
  };

  private readonly onGeoLocError = (geoLocErr: GeolocationPositionError) => {
    alert("Error fetching your location!\nDon't worry! We'll use defaults.");
    console.error(geoLocErr);
    appService.setMapLoading(false);
    this.perms[1](() => ({ granted: true, requested: true }));
  };
}

export const locationService = LocationService.getInstance();
