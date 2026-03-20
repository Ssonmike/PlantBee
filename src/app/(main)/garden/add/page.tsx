"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function AddPlantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customName: "",
    locationInHome: "",
    notes: "",
    waterFrequencyDays: "7",
    fertilizeFreqDays: "",
    sunlight: "medium",
  });

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customName.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customName: form.customName,
          locationInHome: form.locationInHome || null,
          notes: form.notes || null,
          waterFrequencyDays: parseInt(form.waterFrequencyDays) || 7,
          fertilizeFreqDays: form.fertilizeFreqDays ? parseInt(form.fertilizeFreqDays) : null,
          sunlight: form.sunlight,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al añadir la planta");
        return;
      }

      router.push(`/garden/${data.id}`);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header title="Añadir planta" showBack backHref="/garden" />

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Scan CTA */}
        <Link
          href="/scan"
          className="card p-4 flex items-center gap-3 mb-6 border-2 border-dashed border-brand-200 bg-brand-50/50 touch-feedback"
        >
          <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📷</span>
          </div>
          <div>
            <p className="font-semibold text-brand-700">Identificar con cámara</p>
            <p className="text-sm text-brand-600/70">
              Más rápido y preciso — Claude IA detecta la especie
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">o añadir manualmente</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre de la planta *"
            value={form.customName}
            onChange={(e) => updateField("customName", e.target.value)}
            placeholder="Ej: Mi monstera, Cactus de la entrada..."
            required
          />

          <Input
            label="Ubicación en casa"
            value={form.locationInHome}
            onChange={(e) => updateField("locationInHome", e.target.value)}
            placeholder="Ej: Ventana sur, Balcón, Salón..."
          />

          {/* Light */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Luz que recibe
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "low", emoji: "🌑", label: "Poca" },
                { value: "medium", emoji: "⛅", label: "Media" },
                { value: "high", emoji: "🌤️", label: "Alta" },
                { value: "direct", emoji: "☀️", label: "Directa" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField("sunlight", opt.value)}
                  className={`p-2 rounded-xl border-2 text-center transition-all ${
                    form.sunlight === opt.value
                      ? "border-brand-400 bg-brand-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="text-xl">{opt.emoji}</div>
                  <div className="text-xs font-medium text-gray-600 mt-1">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Water frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Riego cada cuántos días
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["3", "5", "7", "14"].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => updateField("waterFrequencyDays", days)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    form.waterFrequencyDays === days
                      ? "border-brand-400 bg-brand-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="font-bold text-gray-900">{days}</div>
                  <div className="text-xs text-gray-500">días</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Riego (días)"
              type="number"
              min="1"
              max="60"
              value={form.waterFrequencyDays}
              onChange={(e) => updateField("waterFrequencyDays", e.target.value)}
              hint="Personalizar"
            />
            <Input
              label="Fertilizar (días)"
              type="number"
              min="1"
              max="365"
              value={form.fertilizeFreqDays}
              onChange={(e) => updateField("fertilizeFreqDays", e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Notas sobre esta planta..."
              className="input resize-none h-24"
              maxLength={500}
            />
          </div>

          <Button type="submit" loading={loading} fullWidth size="lg">
            Añadir al jardín
          </Button>
        </form>
      </div>
    </div>
  );
}
