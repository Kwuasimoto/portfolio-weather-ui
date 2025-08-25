import { Icons } from "src/components/weather-layer";
import { SetStoreFunction, Store } from "solid-js/store";

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

export interface City {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: "city" | "town" | "village";
  importance: number;
  boundingbox: [string, string, string, string]; // [minlat, maxlat, minlon, maxlon]
}

export interface WeatherData {
  id: string;
  loc: LatLng;
  temperature: number;
  condition: Icons;
  location: string;
  humidity?: number;
  windSpeed?: number;
  description?: string;
  timestamp: number;
}

export type WeatherDataCache = Map<
  string,
  {
    data: WeatherData[];
    timestamp: number;
  }
>;
