"use client";

import { useState } from "react";

interface CurrentLocation {
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
}

interface LocationSetupProps {
  currentLocation: CurrentLocation | null;
}

export default function LocationSetup({ currentLocation }: LocationSetupProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function detectLocation() {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocode using Open-Meteo geocoding (or a simple fetch)
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "es" } }
          );
          const geoData = await geoRes.json();

          const city =
            geoData.address?.city ??
            geoData.address?.town ??
            geoData.address?.village ??
            "Tu ciudad";
          const country = geoData.address?.country ?? "Tu país";
          const countryCode = geoData.address?.country_code?.toUpperCase() ?? "";

          // Save to backend
          await fetch("/api/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude,
              longitude,
              city,
              country,
              countryCode,
            }),
          });

          setDone(true);
          // Refresh page to show new location
          window.location.reload();
        } catch {
          setError("Error al guardar la ubicación");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("No se pudo obtener tu ubicación. Verifica los permisos.");
        setLoading(false);
      }
    );
  }

  if (done) {
    return (
      <span className="text-brand-600 text-sm font-medium">✓ Guardado</span>
    );
  }

  return (
    <div>
      <button
        onClick={detectLocation}
        disabled={loading}
        className="flex items-center gap-1.5 text-brand-600 text-sm font-medium hover:underline disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            Detectando...
          </>
        ) : currentLocation ? (
          "Actualizar ubicación"
        ) : (
          <>
            <span>📍</span> Detectar mi ubicación
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
