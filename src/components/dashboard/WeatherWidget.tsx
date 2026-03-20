"use client";

import { useEffect, useState } from "react";
import type { WeatherData } from "@/types";
import { getSeasonLabel } from "@/lib/weather";

interface WeatherWidgetProps {
  lat: number | null;
  lng: number | null;
  city: string | null;
}

export default function WeatherWidget({ lat, lng, city }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lng) {
      setLoading(false);
      return;
    }

    fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((data: WeatherData) => setWeather(data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="card p-4 skeleton h-20" />
    );
  }

  if (!weather) return null;

  return (
    <div className="card p-4 bg-gradient-to-br from-blue-50 to-brand-50 border-blue-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{city ?? "Tu ubicación"}</p>
          <p className="text-2xl font-bold text-gray-900">{Math.round(weather.temperature)}°C</p>
          <p className="text-sm text-gray-600">{weather.description}</p>
        </div>
        <div className="text-right">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
              <span>💧</span>
              <span>{weather.humidity}% humedad</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
              <span>🌤️</span>
              <span>UV {Math.round(weather.uvIndex)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-brand-600 font-medium justify-end">
              <span>🌿</span>
              <span>{getSeasonLabel(weather.season)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
