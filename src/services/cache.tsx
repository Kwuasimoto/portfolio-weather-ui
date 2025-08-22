import { WeatherDataCache, Cache, WeatherData } from "@types";

export class WeatherCache implements Cache<WeatherData> {
  private cache: WeatherDataCache = new Map();
  private readonly TTL = 10 * 60 * 1000; // 10 mins

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry || Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: WeatherData[]) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear() {
    this.cache.clear();
  }
}
