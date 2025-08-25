import { City, LatLng, LocationPermission, MapBounds, State } from "@types";
import { appService } from "@services";
import { createStore } from "solid-js/store";

class LocationService {
  private static instance: LocationService;

  private readonly permsKey = "kwuasi-weather_perms";
  private readonly boundsKey = "kwuasi-weather_bounds";
  private readonly latLonKey = "kwuasi-weather_latLon";

  private readonly perms: State<LocationPermission>;
  private readonly bounds: State<MapBounds>;
  private readonly latLng: State<LatLng>;

  private constructor() {
    // Check if perms exists in local storage
    this.perms = createStore(this.readPerms());
    this.bounds = createStore(this.readBounds());
    this.latLng = createStore(this.readLatLng());
  }
  static getInstance() {
    if (!LocationService.instance)
      LocationService.instance = new LocationService();
    return LocationService.instance;
  }

  onAccept(cb?: (state: boolean) => void) {
    try {
      appService.setMapLoading(true);
      navigator.geolocation.getCurrentPosition(
        (loc) => {
          this.onGeoLocSuccess(loc);
          if (cb) cb(true);
        },
        (err) => {
          this.onGeoLocError(err);
          if (cb) cb(false);
        },
        { timeout: 30000 },
      );
    } catch (e) {
      console.error("Unknown error occured fetching geolocation position", e);
      appService.setMapLoading(false);
      this.perms[1](() => ({ granted: true, requested: true }));
    }
  }

  onDecline(cb?: (state: boolean) => void) {
    this.perms[1](() => ({ granted: false, requested: true }));

    this.writePerms();
    this.writeBounds();
    this.writeLatLng();

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

  getLatLng() {
    return this.latLng[0];
  }

  private readonly onGeoLocSuccess = (geoLoc: GeolocationPosition) => {
    console.log("Successfully fetched geolocation", geoLoc);

    this.perms[1](() => ({
      granted: true,
      requested: true,
    }));
    this.bounds[1]((prev) => ({
      ...prev,
      north: geoLoc.coords.latitude + 0.25,
      south: geoLoc.coords.latitude - 0.25,
      east: geoLoc.coords.longitude + 0.25,
      west: geoLoc.coords.longitude - 0.25,
    }));
    this.latLng[1]((prev) => ({
      ...prev,
      lat: geoLoc.coords.latitude,
      lng: geoLoc.coords.longitude,
    }));

    appService.setMapLoading(false);

    this.writePerms();
    this.writeBounds();
    this.writeLatLng();
  };

  private readonly onGeoLocError = (geoLocErr: GeolocationPositionError) => {
    alert("Error fetching your location!\n\nDon't worry! We'll use defaults.");
    this.debugGeoLocError(geoLocErr);

    this.perms[1](() => ({
      granted: false,
      requested: true,
    }));
    this.latLng[1](() => ({
      lat: 44.0,
      lng: -79,
    }));

    appService.setMapLoading(false);

    this.writePerms();
    this.writeBounds();
    this.writeLatLng();
  };

  private readonly debugGeoLocError = (geoLocErr: GeolocationPositionError) => {
    console.log("Navigator exists:", !!navigator);
    console.log("Geolocation exists:", !!navigator.geolocation);
    console.log("User agent:", navigator.userAgent);
    console.log(
      "ERROR CODE:",
      geoLocErr.code,
      "MESSAGE:",
      geoLocErr.message,
      "Full error:",
      geoLocErr,
    );
    console.error(geoLocErr);
  };

  onZoomEnd(leafMap?: L.Map) {
    if (!leafMap) {
      console.log(
        "Leafmap error: unable to get map information because it's undefined.",
      );
      return;
    }

    this.setBounds(leafMap);
    this.setLatLng(leafMap);

    this.writeBounds();
    this.writeLatLng();
  }

  onDragEnd(leafMap?: L.Map) {
    if (!leafMap) {
      console.log(
        "Leafmap error: unable to get map information because it's undefined.",
      );
      return;
    }

    this.setLatLng(leafMap);
    this.writeLatLng();
  }

  // Prob worth moving local storage related code to a persistence service.

  private readPerms(): LocationPermission {
    const existingPermsSerialized = localStorage.getItem(this.permsKey);
    if (!existingPermsSerialized) {
      return {
        granted: false,
        requested: false,
      };
    }
    return JSON.parse(existingPermsSerialized);
  }
  private writePerms() {
    localStorage.setItem(this.permsKey, JSON.stringify(this.perms[0]));
  }

  private readBounds(): MapBounds {
    const existingBoundsSerialized = localStorage.getItem(this.boundsKey);
    if (!existingBoundsSerialized) {
      return {
        north: 51.505,
        south: 5.505,
        east: -0.09,
        west: -1.09,
        zoom: 13,
      };
    }
    return JSON.parse(existingBoundsSerialized);
  }
  private writeBounds() {
    localStorage.setItem(this.boundsKey, JSON.stringify(this.bounds[0]));
  }
  setBounds(leafMap: L.Map) {
    console.log("Bounds adjusted.");
    const bounds = leafMap.getBounds();
    const zoom = leafMap.getZoom();

    this.bounds[1]((prev) => ({
      ...prev,
      zoom,
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    }));
  }

  private readLatLng() {
    const existingLatLngSerialized = localStorage.getItem(this.latLonKey);
    if (!existingLatLngSerialized) {
      return {
        lat: 51.505 - 0.5,
        lon: -0.09 - 0.5,
      };
    }
    return JSON.parse(existingLatLngSerialized);
  }
  private writeLatLng() {
    localStorage.setItem(this.latLonKey, JSON.stringify(this.latLng[0]));
  }

  setLatLng(leafMap: L.Map) {
    console.log("LatLng adjusted.");
    this.latLng[1]((prev) => ({
      ...prev,
      ...leafMap.getBounds().getCenter(),
    }));
  }

  private async fetchCitiesByViewbox(): Promise<City[]> {
    const bounds = this.bounds[0];
    const viewbox = `${bounds.west},${bounds.north},${bounds.east},${bounds.south}`;
    const placeTypes = ["city"];
    const allResults: City[] = [];

    try {
      for (const place of placeTypes) {
        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?q=${place}` + // Search for cities, towns, villages
          `&viewbox=${viewbox}` +
          `&bounded=1` + // Strictly limit to viewbox
          `&limit=3` + // Max results
          `&format=json` +
          `&addressdetails=1`;
        const response = await fetch(url);
        const cities: City[] = await response.json();

        allResults.push(...cities);
      }
    } catch (e) {
      console.error("Failed to fetch cities", e);
    }

    return allResults;
  }

  async getNearbyCities() {
    try {
      const cities = await this.fetchCitiesByViewbox();
      console.log("Parsed cities by bounds", cities);
    } catch (e) {
      console.error("Failed to fetch cities", e);
      return [];
    }
  }
}

export const locationService = LocationService.getInstance();
