"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  plantId: string;
}

export function ArchivePlantButton({ plantId }: { plantId: string }) {
  return (
    <button
      className="w-full text-red-500 text-sm font-medium py-3 rounded-2xl border border-red-200 hover:bg-red-50 transition-colors"
      onClick={() => {
        if (confirm("¿Archivar esta planta? Podrás recuperarla más adelante.")) {
          fetch(`/api/plants/${plantId}`, { method: "DELETE" }).then(() => {
            window.location.href = "/garden";
          });
        }
      }}
    >
      🗂️ Archivar planta
    </button>
  );
}

export default function PlantDetailActions({ plantId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100"
      >
        <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-10 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 min-w-44 overflow-hidden">
            <Link
              href={`/garden/${plantId}/edit`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
              onClick={() => setOpen(false)}
            >
              <span>✏️</span> Editar planta
            </Link>
            <Link
              href={`/scan?plantId=${plantId}&mode=diagnose`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
              onClick={() => setOpen(false)}
            >
              <span>🔬</span> Diagnosticar
            </Link>
            <Link
              href={`/calendar?plantId=${plantId}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
              onClick={() => setOpen(false)}
            >
              <span>📅</span> Ver calendario
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
