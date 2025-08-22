import { MapBounds, WeatherDataCache } from "@types";
import { WeatherData } from "@types";
import { LatitudeLongitude, LocationPermission } from "@types";
import { Component, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export const WeatherMap: Component<{}> = () => {
  const [permission, setPermissions] = createSignal<LocationPermission>({
    granted: false,
    requested: false,
  });

  const [userLocation, setUserLocation] =
    createSignal<LatitudeLongitude | null>(null);

  const [mapBounds, setMapBounds] = createSignal<MapBounds>({
    north: 44.0,
    south: 43.5,
    east: -79.0,
    west: -80.0,
    zoom: 10,
  });

  const [weatherData, setWeatherData] = createSignal<WeatherData[]>([]);
  const [loading, setLoading] = createSignal(false);

  const [cache] = createStore<WeatherDataCache>(new Map());

  return <div></div>;
};
