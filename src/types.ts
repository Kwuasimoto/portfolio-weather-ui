import { SetStoreFunction, Store } from "solid-js/store";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface WeatherData {
  id: string;
  loc: LatLng;
  temp: number;
  description: string;
  icon: string;
  timestamp: number;
}

export interface Cache<T> {
  get(key: string): T[] | null;
  set(key: string, data: T[]): void;
  clear(): void;
}

export type WeatherDataCache = Map<
  string,
  {
    data: WeatherData[];
    timestamp: number;
  }
>;

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

export type PermissionModalProps = {
  onAccept: () => void;
  onDecline: () => void;
};

export type WeatherOverlayProps = {
  weather?: WeatherData;
  position?: Position;
};

export type State<T> = [Store<T>, SetStoreFunction<T>];
