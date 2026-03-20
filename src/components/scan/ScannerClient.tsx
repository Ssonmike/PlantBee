"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { PlantIdentificationResult, PlantDiagnosisResult } from "@/types";
import { getIssueTypeEmoji, getIssueTypeLabel } from "@/lib/ai";

type ScanMode = "identify" | "diagnose";
type ScanState = "camera" | "preview" | "loading" | "result" | "error";

export default function ScannerClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userPlantId = searchParams.get("plantId");
  const initialMode = (searchParams.get("mode") as ScanMode) ?? "identify";

  const [mode, setMode] = useState<ScanMode>(initialMode);
  const [state, setState] = useState<ScanState>("camera");
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<PlantIdentificationResult | PlantDiagnosisResult | null>(null);
  const [identifiedPlantId, setIdentifiedPlantId] = useState<string | null>(null);
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [addingToGarden, setAddingToGarden] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [state, startCamera, stopCamera]);

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    setImageData(base64);
    setState("preview");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageData(event.target?.result as string);
      setState("preview");
    };
    reader.readAsDataURL(file);
  }

  async function analyzePlant() {
    if (!imageData) return;

    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageData,
          scanType: mode,
          userPlantId: userPlantId ?? undefined,
          mimeType: "image/jpeg",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al analizar la imagen");
        setState("error");
        return;
      }

      setResult(data.result);
      if (data.plantId) setIdentifiedPlantId(data.plantId);
      if (data.diagnosisId) setDiagnosisId(data.diagnosisId);
      setState("result");
    } catch {
      setError("Error de conexión. Verifica tu internet e inténtalo de nuevo.");
      setState("error");
    }
  }

  async function addToGarden() {
    if (!result || mode !== "identify") return;
    const identResult = result as PlantIdentificationResult;

    setAddingToGarden(true);
    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customName: identResult.commonName,
          plantId: identifiedPlantId,
          photoUrl: imageData,
          waterFrequencyDays: identResult.careRequirements.waterFrequencyDays,
          fertilizeFreqDays: identResult.careRequirements.fertilizeFreqDays,
          sunlight: identResult.careRequirements.sunlight,
        }),
      });

      const plant = await res.json();
      if (res.ok) {
        router.push(`/garden/${plant.id}`);
      }
    } catch {
      setAddingToGarden(false);
    }
  }

  // ── CAMERA SCREEN ──────────────────────────────────────────
  if (state === "camera") {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 z-10 relative">
          <Link
            href={userPlantId ? `/garden/${userPlantId}` : "/dashboard"}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/50"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>

          {/* Mode selector */}
          <div className="flex rounded-xl bg-black/50 p-1 gap-1">
            <button
              onClick={() => setMode("identify")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === "identify" ? "bg-white text-gray-900" : "text-white"
              }`}
            >
              Identificar
            </button>
            <button
              onClick={() => setMode("diagnose")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === "diagnose" ? "bg-white text-gray-900" : "text-white"
              }`}
            >
              Diagnosticar
            </button>
          </div>

          <div className="w-10" />
        </div>

        {/* Camera feed */}
        {cameraError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white px-8 text-center">
            <div className="text-5xl mb-4">📷</div>
            <h3 className="text-xl font-bold mb-2">Sin acceso a cámara</h3>
            <p className="text-white/70 text-sm mb-6">
              Activa los permisos de cámara en la configuración de tu navegador.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Subir foto de galería
            </button>
          </div>
        ) : (
          <div className="flex-1 relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Viewfinder guide */}
            <div className="absolute inset-8 border-2 border-white/40 rounded-3xl">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl -translate-x-1 -translate-y-1" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl translate-x-1 -translate-y-1" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl -translate-x-1 translate-y-1" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl translate-x-1 translate-y-1" />
            </div>
            {/* Hint */}
            <div className="absolute bottom-32 inset-x-0 text-center">
              <div className="inline-block bg-black/50 px-4 py-2 rounded-full text-white/90 text-sm">
                {mode === "identify"
                  ? "Enfoca toda la planta"
                  : "Enfoca el área con el problema"}
              </div>
            </div>
          </div>
        )}

        {/* Bottom controls */}
        <div
          className="flex items-center justify-around px-8 py-6"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        >
          {/* Gallery */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Capture button */}
          <button
            onClick={capturePhoto}
            disabled={cameraError}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-300" />
          </button>

          {/* Placeholder */}
          <div className="w-12" />
        </div>

        {/* Hidden elements */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    );
  }

  // ── PREVIEW SCREEN ─────────────────────────────────────────
  if (state === "preview" && imageData) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setState("camera")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/50"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white font-medium">
            {mode === "identify" ? "Identificar planta" : "Diagnosticar problema"}
          </span>
          <div className="w-10" />
        </div>

        <div className="flex-1 relative">
          <Image src={imageData} alt="Preview" fill className="object-contain" />
        </div>

        <div
          className="px-6 py-6 bg-gradient-to-t from-black to-transparent flex gap-3"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={() => setState("camera")}
            className="flex-1 py-3 rounded-2xl bg-white/20 text-white font-semibold"
          >
            Repetir
          </button>
          <button
            onClick={analyzePlant}
            className="flex-2 py-3 px-6 rounded-2xl btn-primary text-base"
          >
            {mode === "identify" ? "🔍 Identificar" : "🔬 Diagnosticar"}
          </button>
        </div>
      </div>
    );
  }

  // ── LOADING SCREEN ─────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        {imageData && (
          <div className="absolute inset-0 opacity-20">
            <Image src={imageData} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="relative text-center px-8">
          <div className="w-20 h-20 rounded-full bg-brand-600/20 border-4 border-brand-400 border-t-transparent animate-spin mx-auto mb-6" />
          <p className="text-xl font-bold mb-2">
            {mode === "identify" ? "Identificando planta..." : "Analizando problema..."}
          </p>
          <p className="text-white/60 text-sm">
            Claude IA está analizando tu imagen
          </p>
        </div>
      </div>
    );
  }

  // ── ERROR SCREEN ───────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error al analizar</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <div className="flex gap-3">
          <button onClick={() => setState("camera")} className="btn-secondary">
            Intentar de nuevo
          </button>
          <Link href="/dashboard" className="btn-ghost">
            Volver
          </Link>
        </div>
      </div>
    );
  }

  // ── RESULT SCREENS ─────────────────────────────────────────
  if (state === "result" && result) {
    if (mode === "identify") {
      return <IdentificationResult
        result={result as PlantIdentificationResult}
        imageData={imageData}
        onRetry={() => setState("camera")}
        onAddToGarden={addToGarden}
        addingToGarden={addingToGarden}
      />;
    } else {
      return <DiagnosisResult
        result={result as PlantDiagnosisResult}
        imageData={imageData}
        userPlantId={userPlantId}
        onRetry={() => setState("camera")}
      />;
    }
  }

  return null;
}

// ── IDENTIFICATION RESULT ──────────────────────────────────

function IdentificationResult({
  result,
  imageData,
  onRetry,
  onAddToGarden,
  addingToGarden,
}: {
  result: PlantIdentificationResult;
  imageData: string | null;
  onRetry: () => void;
  onAddToGarden: () => void;
  addingToGarden: boolean;
}) {
  const confidence = Math.round(result.confidence * 100);
  const confidenceColor =
    confidence >= 80 ? "text-brand-600" : confidence >= 60 ? "text-honey-600" : "text-red-500";

  return (
    <div className="min-h-screen bg-brand-50">
      {/* Photo header */}
      {imageData && (
        <div className="relative w-full h-64">
          <Image src={imageData} alt="Plant" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-white text-2xl font-bold">{result.commonName}</h1>
            <p className="text-white/80 italic text-sm">{result.scientificName}</p>
          </div>
          <button
            onClick={onRetry}
            className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-xl bg-black/50"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* Confidence */}
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Confianza de identificación</p>
            <p className={`text-2xl font-bold ${confidenceColor}`}>{confidence}%</p>
          </div>
          <div className="w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={confidence >= 80 ? "#16a34a" : confidence >= 60 ? "#d97706" : "#ef4444"}
                strokeWidth="3"
                strokeDasharray={`${confidence} ${100 - confidence}`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Description */}
        <div className="card p-4">
          <p className="text-sm text-gray-700 leading-relaxed">{result.description}</p>
          {result.family && (
            <p className="text-xs text-gray-400 mt-2">Familia: {result.family}</p>
          )}
        </div>

        {/* Care requirements */}
        <div className="card p-4">
          <h3 className="font-bold text-gray-900 mb-3">Cuidados básicos</h3>
          <div className="grid grid-cols-2 gap-2">
            <CareChip emoji="💧" label={`Cada ${result.careRequirements.waterFrequencyDays} días`} sub="Riego" />
            <CareChip emoji="☀️" label={{
              low: "Poca luz", medium: "Luz media", high: "Mucha luz", direct: "Sol directo"
            }[result.careRequirements.sunlight] ?? result.careRequirements.sunlight} sub="Luz" />
            <CareChip emoji="💦" label={{
              low: "Baja", medium: "Media", high: "Alta"
            }[result.careRequirements.humidity] ?? result.careRequirements.humidity} sub="Humedad" />
            {result.careRequirements.tempMin !== undefined && (
              <CareChip emoji="🌡️" label={`${result.careRequirements.tempMin}–${result.careRequirements.tempMax}°C`} sub="Temperatura" />
            )}
          </div>
          {result.careRequirements.notes && (
            <p className="text-xs text-gray-500 mt-3 italic">💡 {result.careRequirements.notes}</p>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center px-4">
          ⚠️ Identificación orientativa por IA. Verifica con fuentes adicionales si tienes dudas.
        </p>

        {/* Actions */}
        <div className="space-y-3 pb-8">
          <button
            onClick={onAddToGarden}
            disabled={addingToGarden}
            className="btn-primary w-full text-base py-4"
          >
            {addingToGarden ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Añadiendo...
              </span>
            ) : "🪴 Añadir a Mi Jardín"}
          </button>
          <button onClick={onRetry} className="btn-secondary w-full">
            Escanear otra planta
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DIAGNOSIS RESULT ───────────────────────────────────────

function DiagnosisResult({
  result,
  imageData,
  userPlantId,
  onRetry,
}: {
  result: PlantDiagnosisResult;
  imageData: string | null;
  userPlantId: string | null;
  onRetry: () => void;
}) {
  const severityConfig = {
    low: { color: "text-brand-600", bg: "bg-brand-50 border-brand-200", emoji: "✅", label: "Leve" },
    medium: { color: "text-honey-600", bg: "bg-honey-50 border-honey-200", emoji: "⚠️", label: "Moderado" },
    high: { color: "text-red-600", bg: "bg-red-50 border-red-200", emoji: "🚨", label: "Grave" },
  }[result.overallSeverity] ?? { color: "text-gray-600", bg: "bg-gray-50 border-gray-200", emoji: "❓", label: "Desconocido" };

  return (
    <div className="min-h-screen bg-brand-50">
      {/* Photo + overlay */}
      {imageData && (
        <div className="relative w-full h-52">
          <Image src={imageData} alt="Plant" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-white text-xl font-bold">
              {result.issues.length === 0
                ? "✅ Planta saludable"
                : `${result.issues.length} problema${result.issues.length > 1 ? "s" : ""} detectado${result.issues.length > 1 ? "s" : ""}`}
            </h1>
          </div>
          <button onClick={onRetry} className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-xl bg-black/50">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* Severity banner */}
        <div className={`rounded-2xl p-4 border ${severityConfig.bg} flex items-center gap-3`}>
          <span className="text-3xl">{severityConfig.emoji}</span>
          <div>
            <p className={`font-bold ${severityConfig.color}`}>
              Gravedad: {severityConfig.label}
            </p>
            <p className="text-sm text-gray-600">
              Confianza: {Math.round(result.confidence * 100)}%
            </p>
          </div>
        </div>

        {/* Issues list */}
        {result.issues.length > 0 && (
          <div className="card p-4">
            <h3 className="font-bold text-gray-900 mb-3">Problemas detectados</h3>
            <div className="space-y-3">
              {result.issues.map((issue, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xl flex-shrink-0">{getIssueTypeEmoji(issue.type)}</span>
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {getIssueTypeLabel(issue.type)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{issue.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div className="card p-4">
            <h3 className="font-bold text-gray-900 mb-3">Qué hacer</h3>
            <div className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand-700 text-xs font-bold">{rec.step}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{rec.description}</p>
                    {rec.timeframe && (
                      <p className="text-xs text-gray-400 mt-0.5">🕐 {rec.timeframe}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
          <p className="text-xs text-amber-700 leading-relaxed">{result.disclaimer}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pb-8">
          {userPlantId && (
            <Link href={`/garden/${userPlantId}`} className="btn-primary w-full text-center block py-4">
              Ver planta en Mi Jardín
            </Link>
          )}
          <button onClick={onRetry} className="btn-secondary w-full">
            Hacer otro escaneo
          </button>
          <Link href="/dashboard" className="btn-ghost w-full text-center block py-2">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function CareChip({ emoji, label, sub }: { emoji: string; label: string; sub: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500">{emoji} {sub}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{label}</p>
    </div>
  );
}
