export interface WeatherData {
  id: string;
  lat: number;
  lon: number;
  temp: number;
  description: string;
  icon: string;
  timestamp: number;
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

export interface PermissionModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export interface WeatherOverlayProps {
  weather: WeatherData;
  position: Position;
}
