/**
 * PlantBee Weather Module
 * Uses Open-Meteo API (free, no API key required)
 * Provides climate data to adjust care recommendations.
 */

import type { WeatherData } from "@/types";

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    uv_index?: number;
    weather_code: number;
  };
}

export async function getWeatherData(
  lat: number,
  lng: number
): Promise<WeatherData | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,uv_index,weather_code"
    );
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!response.ok) return null;

    const data = (await response.json()) as OpenMeteoResponse;
    const current = data.current;

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      uvIndex: current.uv_index ?? 0,
      windSpeed: current.wind_speed_10m,
      description: getWeatherDescription(current.weather_code),
      season: getSeason(lat),
    };
  } catch {
    return null;
  }
}

function getWeatherDescription(code: number): string {
  if (code === 0) return "Despejado";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 49) return "Niebla";
  if (code <= 69) return "Lluvia ligera";
  if (code <= 79) return "Nieve";
  if (code <= 82) return "Lluvia";
  if (code <= 99) return "Tormenta";
  return "Variable";
}

function getSeason(lat: number): "spring" | "summer" | "autumn" | "winter" {
  const month = new Date().getMonth(); // 0-11
  const isNorthernHemisphere = lat >= 0;

  if (isNorthernHemisphere) {
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "autumn";
    return "winter";
  } else {
    // Southern hemisphere - reversed seasons
    if (month >= 2 && month <= 4) return "autumn";
    if (month >= 5 && month <= 7) return "winter";
    if (month >= 8 && month <= 10) return "spring";
    return "summer";
  }
}

export function getSeasonLabel(season: string): string {
  const labels: Record<string, string> = {
    spring: "Primavera",
    summer: "Verano",
    autumn: "Otoño",
    winter: "Invierno",
  };
  return labels[season] ?? season;
}
