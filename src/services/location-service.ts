import {
  LatLng,
  LocationPermission,
  MapBounds,
  State,
  SettlementRaw,
  Settlement,
  SettlementAddressRaw,
  SettlementAddress,
} from "@types";
import { createStore } from "solid-js/store";
import { appService, storageService } from "@services";
import { Defaults } from "@enums";

import L from "leaflet";

class LocationService {
  private static instance: LocationService;

  private readonly permsKey = "kwuasi-weather_perms";
  private readonly boundsKey = "kwuasi-weather_bounds";
  private readonly latLonKey = "kwuasi-weather_latLon";

  private readonly perms: State<LocationPermission>;
  private readonly bounds: State<MapBounds>;
  private readonly latLng: State<LatLng>;

  readonly defaultZoom: number = Defaults.ZOOM_MAX;

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
    const existingPerms = storageService.read<LocationPermission>(
      this.permsKey,
    );
    if (!existingPerms) {
      return {
        granted: false,
        requested: false,
      };
    }
    return existingPerms;
  }
  private writePerms() {
    storageService.write(this.permsKey, this.perms[0]);
  }

  private readBounds(): MapBounds {
    const existingBoundsSerialized = localStorage.getItem(this.boundsKey);
    if (!existingBoundsSerialized) {
      return {
        north: 51.505,
        south: 5.505,
        east: -0.09,
        west: -1.09,
        zoom: this.defaultZoom,
      };
    }
    return JSON.parse(existingBoundsSerialized);
  }
  private writeBounds() {
    storageService.write(this.boundsKey, this.bounds[0]);
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
    storageService.write(this.latLonKey, this.latLng[0]);
  }
  setLatLng(leafMap: L.Map) {
    console.log("LatLng adjusted.");
    this.latLng[1]((prev) => ({
      ...prev,
      ...leafMap.getBounds().getCenter(),
    }));
  }

  private async fetchSettlementsWithinViewbox(): Promise<SettlementRaw[]> {
    const bounds = this.bounds[0];
    const viewbox = `${bounds.west},${bounds.north},${bounds.east},${bounds.south}`;

    const settlementTypes = ["city"];
    const settlements: SettlementRaw[] = [];

    for (const settlement of settlementTypes) {
      try {
        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?q=${settlement}` + // Search for cities, towns, villages
          `&viewbox=${viewbox}` +
          `&bounded=1` + // Strictly limit to viewbox
          `&format=json` +
          `&addressdetails=1`;

        const response = await fetch(url);
        const result: SettlementRaw[] = await response.json();

        settlements.push(...result);
      } catch (e) {
        console.error(`Failed to fetch ${settlement} information`, e);
      }
    }

    return settlements;
  }

  async getNearbySettlements(): Promise<Settlement[]> {
    try {
      const settlements = await this.fetchSettlementsWithinViewbox();
      return settlements.map(this.parseSettlementRaw);
    } catch (e) {
      console.error("Failed to parse cities", e);
      return [];
    }
  }

  private readonly parseSettlementRaw = (
    settlementRaw: SettlementRaw,
  ): Settlement => {
    return {
      address: this.parseSettlementAddressRaw(settlementRaw.address),
      bounds: L.latLngBounds(
        [
          Number.parseFloat(settlementRaw.boundingbox[0]),
          Number.parseFloat(settlementRaw.boundingbox[2]),
        ],
        [
          Number.parseFloat(settlementRaw.boundingbox[1]),
          Number.parseFloat(settlementRaw.boundingbox[3]),
        ],
      ),
      class: settlementRaw.class,
      importance: settlementRaw.importance,
      lat: Number.parseFloat(settlementRaw.lat),
      lng: Number.parseFloat(settlementRaw.lng),
      liscense: settlementRaw.liscense,
      name: settlementRaw.name,
      placeId: settlementRaw.place_id,
      type: settlementRaw.type,
    };
  };

  private readonly parseSettlementAddressRaw = (
    settlementAddressRaw: SettlementAddressRaw,
  ): SettlementAddress => {
    return {
      "ISO3166-2-lvl4": settlementAddressRaw["ISO3166-2-lvl4"],
      country: settlementAddressRaw.country,
      countryCode: settlementAddressRaw.country_code,
      state: settlementAddressRaw.state,
      stateDistrict: settlementAddressRaw.state_district,
    };
  };
}

export const locationService = LocationService.getInstance();
