"use client";

import { useState } from "react";
import { format, startOfWeek, addDays, isToday, isSameDay, isPast } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { getCareTypeEmoji, getCareTypeLabel, cn } from "@/lib/utils";
import type { CareType } from "@/types";

interface Reminder {
  id: string;
  userPlantId: string;
  careType: string;
  dueDate: string;
  isDone: boolean;
  isSnoozed: boolean;
  userPlant: {
    id: string;
    customName: string;
    photoUrl: string | null;
    healthStatus: string;
  };
}

interface CalendarViewProps {
  initialReminders: Reminder[];
}

export default function CalendarView({ initialReminders }: CalendarViewProps) {
  const [reminders, setReminders] = useState(initialReminders);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Build week days starting from today - 1
  const weekStart = addDays(new Date(), -1);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const selectedDateReminders = reminders.filter(
    (r) => !r.isDone && isSameDay(new Date(r.dueDate), selectedDate)
  );

  const allPendingCount = reminders.filter((r) => !r.isDone).length;
  const overdueCount = reminders.filter(
    (r) => !r.isDone && isPast(new Date(r.dueDate)) && !isToday(new Date(r.dueDate))
  ).length;

  function getReminderCountForDay(date: Date): { total: number; overdue: number } {
    const dayReminders = reminders.filter(
      (r) => !r.isDone && isSameDay(new Date(r.dueDate), date)
    );
    const overdue = isPast(date) && !isToday(date) ? dayReminders.length : 0;
    return { total: dayReminders.length, overdue };
  }

  async function markDone(reminderId: string) {
    setCompletingId(reminderId);
    try {
      await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderId, action: "done" }),
      });
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? { ...r, isDone: true } : r))
      );
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <div className="px-4 py-4">
      {/* Summary */}
      {(allPendingCount > 0 || overdueCount > 0) && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 card p-3 text-center">
            <p className="text-2xl font-bold text-brand-600">{allPendingCount}</p>
            <p className="text-xs text-gray-500">Pendientes</p>
          </div>
          {overdueCount > 0 && (
            <div className="flex-1 card p-3 text-center border-red-200">
              <p className="text-2xl font-bold text-red-500">{overdueCount}</p>
              <p className="text-xs text-gray-500">Atrasadas</p>
            </div>
          )}
        </div>
      )}

      {/* Week strip */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 no-scrollbar">
        {weekDays.map((day) => {
          const { total, overdue } = getReminderCountForDay(day);
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center gap-1 py-2 px-2.5 rounded-2xl w-12 transition-all",
                selected
                  ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                  : today
                  ? "bg-brand-50 border-2 border-brand-300"
                  : "bg-white border border-gray-100"
              )}
            >
              <span className={cn("text-xs font-medium", selected ? "text-brand-100" : "text-gray-400")}>
                {format(day, "EEE", { locale: es }).slice(0, 2)}
              </span>
              <span className={cn("text-base font-bold", selected ? "text-white" : today ? "text-brand-700" : "text-gray-800")}>
                {format(day, "d")}
              </span>
              {total > 0 && (
                <span className={cn(
                  "text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold",
                  selected ? "bg-white text-brand-600" : overdue ? "bg-red-500 text-white" : "bg-honey-400 text-white"
                )}>
                  {total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day tasks */}
      <div>
        <h2 className="section-title">
          {isToday(selectedDate)
            ? "Hoy"
            : format(selectedDate, "EEEE, d MMMM", { locale: es })}
        </h2>

        {selectedDateReminders.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-medium text-gray-700">Sin tareas este día</p>
            <p className="text-sm text-gray-400 mt-1">¡Disfruta el descanso!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={cn(
                  "card p-4 flex items-center gap-3",
                  isPast(new Date(reminder.dueDate)) && !isToday(new Date(reminder.dueDate))
                    ? "border-l-4 border-l-red-400"
                    : isToday(new Date(reminder.dueDate))
                    ? "border-l-4 border-l-honey-400"
                    : ""
                )}
              >
                {/* Plant photo */}
                <Link href={`/garden/${reminder.userPlant.id}`} className="flex-shrink-0">
                  {reminder.userPlant.photoUrl ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden">
                      <Image
                        src={reminder.userPlant.photoUrl}
                        alt={reminder.userPlant.customName}
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
                  <Link href={`/garden/${reminder.userPlant.id}`}>
                    <p className="font-semibold text-gray-900 truncate">
                      {reminder.userPlant.customName}
                    </p>
                  </Link>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span>{getCareTypeEmoji(reminder.careType as CareType)}</span>
                    <span>{getCareTypeLabel(reminder.careType as CareType)}</span>
                  </p>
                </div>

                {/* Complete button */}
                <button
                  onClick={() => markDone(reminder.id)}
                  disabled={completingId === reminder.id}
                  className="w-10 h-10 rounded-xl bg-brand-100 hover:bg-brand-200 flex items-center justify-center transition-all active:scale-90"
                >
                  {completingId === reminder.id ? (
                    <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming overview */}
      <div className="mt-6">
        <h2 className="section-title">Esta semana</h2>
        <div className="space-y-1">
          {weekDays.map((day) => {
            const dayRems = reminders.filter(
              (r) => !r.isDone && isSameDay(new Date(r.dueDate), day)
            );
            if (dayRems.length === 0) return null;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white transition-colors text-left"
              >
                <span className={cn(
                  "text-sm font-medium w-20 flex-shrink-0",
                  isToday(day) ? "text-brand-600 font-bold" : "text-gray-500"
                )}>
                  {isToday(day) ? "Hoy" : format(day, "EEE d", { locale: es })}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {dayRems.slice(0, 4).map((r) => (
                    <span
                      key={r.id}
                      className="text-sm bg-white rounded-lg px-2 py-0.5 border border-gray-100 text-gray-600"
                    >
                      {getCareTypeEmoji(r.careType as CareType)} {r.userPlant.customName}
                    </span>
                  ))}
                  {dayRems.length > 4 && (
                    <span className="text-xs text-gray-400 self-center">+{dayRems.length - 4}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
