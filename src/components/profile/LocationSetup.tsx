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
          const saveRes = await fetch("/api/location", {
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

          if (!saveRes.ok) {
            const errData = await saveRes.json().catch(() => ({}));
            throw new Error(errData.error ?? "Error al guardar la ubicación");
          }

          setDone(true);
          // Refresh page to show new location
          window.location.reload();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error al guardar la ubicación");
        } finally {
          setLoading(false);
        }
      },
      (posErr) => {
        if (posErr.code === 1) {
          setError("Permiso de ubicación denegado. Ve a Configuración > Privacidad > Ubicación y permite el acceso al navegador.");
        } else if (posErr.code === 2) {
          setError("No se pudo determinar tu ubicación. Asegúrate de tener GPS o conexión activa.");
        } else {
          setError("Tiempo de espera agotado. Inténtalo de nuevo.");
        }
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
