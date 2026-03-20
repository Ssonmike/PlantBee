"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn, getCareTypeEmoji, getCareTypeLabel } from "@/lib/utils";
import type { CareType } from "@/types";

interface DashboardTaskCardProps {
  reminderId: string;
  userPlantId: string;
  plantName: string;
  plantPhoto?: string | null;
  careType: CareType;
  dueDate: string;
  urgency: "overdue" | "today" | "soon";
}

export default function DashboardTaskCard({
  reminderId,
  userPlantId,
  plantName,
  plantPhoto,
  careType,
  dueDate,
  urgency,
}: DashboardTaskCardProps) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function markDone() {
    setLoading(true);
    try {
      await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderId, action: "done" }),
      });
      setDone(true);
    } catch {
      // fail silently, user can try again
    } finally {
      setLoading(false);
    }
  }

  if (done) return null;

  return (
    <div
      className={cn(
        "card p-4 flex items-center gap-3 border-l-4 transition-all",
        urgency === "overdue"
          ? "border-l-red-400"
          : urgency === "today"
          ? "border-l-honey-400"
          : "border-l-brand-400"
      )}
    >
      {/* Plant photo / emoji */}
      <Link href={`/garden/${userPlantId}`} className="flex-shrink-0">
        {plantPhoto ? (
          <div className="w-12 h-12 rounded-xl overflow-hidden">
            <Image
              src={plantPhoto}
              alt={plantName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🌿</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/garden/${userPlantId}`}>
          <p className="font-semibold text-gray-900 truncate">{plantName}</p>
        </Link>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <span>{getCareTypeEmoji(careType)}</span>
          <span>{getCareTypeLabel(careType)}</span>
          {urgency === "overdue" && (
            <span className="text-red-500 font-medium">· Atrasado</span>
          )}
        </p>
      </div>

      {/* Done button */}
      <button
        onClick={markDone}
        disabled={loading}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
          loading
            ? "bg-gray-100"
            : "bg-brand-100 hover:bg-brand-200 active:scale-90"
        )}
        aria-label="Marcar como hecho"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-5 h-5 text-brand-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
