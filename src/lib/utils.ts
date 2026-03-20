import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isPast, addDays } from "date-fns";
import { es } from "date-fns/locale";
import type { CareType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern = "dd MMM yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: es });
}

export function getRelativeDateLabel(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Hoy";
  if (isTomorrow(d)) return "Mañana";
  if (isPast(d)) return `Hace ${Math.floor((Date.now() - d.getTime()) / 86400000)} días`;
  return formatDate(d, "dd MMM");
}

export function getCareTypeLabel(type: CareType): string {
  const labels: Record<CareType, string> = {
    water: "Riego",
    fertilize: "Fertilizar",
    repot: "Trasplantar",
    prune: "Podar",
    mist: "Nebulizar",
    rotate: "Rotar",
  };
  return labels[type] ?? type;
}

export function getCareTypeEmoji(type: CareType): string {
  const emojis: Record<CareType, string> = {
    water: "💧",
    fertilize: "🌱",
    repot: "🪴",
    prune: "✂️",
    mist: "💦",
    rotate: "🔄",
  };
  return emojis[type] ?? "📌";
}

export function getHealthStatusColor(status: string): string {
  switch (status) {
    case "good": return "text-brand-600 bg-brand-50";
    case "warning": return "text-honey-600 bg-honey-50";
    case "critical": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

export function getHealthStatusLabel(status: string): string {
  switch (status) {
    case "good": return "Saludable";
    case "warning": return "Atención";
    case "critical": return "Urgente";
    default: return "Desconocido";
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "low": return "text-brand-600 bg-brand-50 border-brand-200";
    case "medium": return "text-honey-700 bg-honey-50 border-honey-200";
    case "high": return "text-red-700 bg-red-50 border-red-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function generateUpcomingReminders(
  userPlantId: string,
  userId: string,
  careType: CareType,
  frequencyDays: number,
  scheduleId: string,
  startDate: Date = new Date(),
  count: number = 8
) {
  const reminders = [];
  let nextDate = new Date(startDate);

  for (let i = 0; i < count; i++) {
    if (i > 0) nextDate = addDays(nextDate, frequencyDays);
    reminders.push({
      userId,
      userPlantId,
      careScheduleId: scheduleId,
      careType,
      dueDate: nextDate,
    });
  }

  return reminders;
}

export function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

export function getImageMimeType(base64: string): string {
  const match = base64.match(/^data:(image\/\w+);base64,/);
  return match ? match[1] : "image/jpeg";
}
