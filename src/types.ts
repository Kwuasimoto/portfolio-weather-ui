import { SetStoreFunction, Store } from "solid-js/store";
import L from "leaflet";

export type State<T> = [Store<T>, SetStoreFunction<T>];

export interface Cache<T> {
  get(key: string): T[] | null;
  set(key: string, data: T[]): void;
  clear(): void;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LocationPermission {
  granted: boolean;
  requested: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}

export interface Position {
  x: number;
  y: number;
}

export type SettlementType = "city" | "village" | "town";

export enum Settlements {
  CITY = "city",
  VILLAGE = "village",
  TOWN = "town",
}

export interface SettlementAddressRaw {
  "ISO3166-2-lvl4": string;
  country: String;
  country_code: string;
  state: string;
  state_district: string;
}

export type SettlementAddress = Omit<
  SettlementAddressRaw & {
    countryCode: string;
    stateDistrict: string;
  },
  "country_code" | "state_district"
>;

export interface SettlementRaw {
  address: SettlementAddressRaw;
  boundingbox: [string, string, string, string]; // [minlat, maxlat, minlon, maxlon]
  class: string;
  display_name: string;
  importance: number;

  liscense: string;

  name: string;

  osm_id: number;
  osm_type: string;

  place_id: number;
  place_rank: number;

  type: "city" | "town" | "village";
}

export type Settlement = {
  address: SettlementAddress;
  bounds: L.LatLngBounds;
  placeId: number;
  type: SettlementType;
} & Omit<
  SettlementRaw,
  | "address"
  | "addressType"
  | "boundingbox"
  | "display_name"
  | "osm_id"
  | "osm_type"
  | "place_id"
  | "place_rank"
>;

export interface WeatherAPIResponse<T> {
  current: T;
  location: WeatherLocation;
}

export interface RealtimeWeatherCurrentRaw {
  icon: string;
  code: number;
  text: string;
}

export interface RealtimeWeatherRaw {
  last_updated: string;
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  windchill_c: number;
  windchill_f: number;
  heatindex_c: number;
  heatindex_f: number;
  condition: RealtimeWeatherCurrentRaw;
  wind_mph: number;
  wind_kph: number;
  humidity: number;
  cloud: number;
  is_day: 0 | 1;
  uv: number;
}

export type RealtimeWeather = {
  lastUpdated: string;
  tempC: number;
  tempF: number;
  feelsLikeC: number;
  feelsLikeF: number;
  windChillC: number;
  windChillF: number;
  heatIndexC: number;
  heatIndexF: number;
  conditionCode: number;
  condition: string;
  windMPH: number;
  windKPH: number;
  isDay: number;
  icon: string; //CDN
} & Omit<
  RealtimeWeatherRaw,
  | "last_updated"
  | "temp_c"
  | "temp_f"
  | "feelslike_c"
  | "feelslike_f"
  | "windchill_c"
  | "windchill_f"
  | "heatindex_c"
  | "heatindex_f"
  | "condition"
  | "wind_mph"
  | "wind_kph"
  | "is_day"
>;

export interface WeatherLocationRaw {
  country: string;
  lat: number;
  lon: number;
  localtime_epoch: number;
  name: string;
  region: string;
  tz_id: string;
}

export type WeatherLocation = Omit<
  WeatherLocationRaw & {
    localtimeEpoch: number;
    tzId: string;
  },
  "localtime_epoch" | "tz_id"
>;

export type WeatherDataCache = Map<
  string,
  {
    data: RealtimeWeather[];
    timestamp: number;
  }
>;

export interface ContrastConfig {
  addDropShadow: boolean;
  addWhiteOutline: boolean;
  boostColors: boolean;
  shadowIntensity: number; // 0-1
  outlineWidth: number; // pixels
}
