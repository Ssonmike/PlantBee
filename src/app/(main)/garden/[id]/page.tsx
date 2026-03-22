import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { getCareTypeEmoji, getCareTypeLabel, getRelativeDateLabel, getHealthStatusLabel } from "@/lib/utils";
import type { CareType } from "@/types";
import { getIssueTypeLabel, getIssueTypeEmoji } from "@/lib/plant-utils";
import PlantDetailActions, { ArchivePlantButton } from "@/components/garden/PlantDetailActions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "Detalle de planta" };
}

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const plant = await db.userPlant.findFirst({
    where: { id, userId: session.user.id },
    include: {
      plant: { include: { careRequirements: true } },
      garden: true,
      careSchedules: { where: { isActive: true }, orderBy: { careType: "asc" } },
      reminders: {
        where: { isDone: false },
        orderBy: { dueDate: "asc" },
        take: 5,
      },
      diagnoses: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  if (!plant) notFound();

  const healthBadge = {
    good: { text: "Saludable", variant: "green" as const, emoji: "✅" },
    warning: { text: "Atención", variant: "yellow" as const, emoji: "⚠️" },
    critical: { text: "Urgente", variant: "red" as const, emoji: "🚨" },
  }[plant.healthStatus] ?? { text: "Desconocido", variant: "gray" as const, emoji: "❓" };

  return (
    <div>
      <Header
        showBack
        backHref="/garden"
        title={plant.customName}
        action={
          <PlantDetailActions plantId={plant.id} />
        }
      />

      <div className="px-4 py-4 space-y-5 max-w-lg mx-auto">
        {/* Hero photo */}
        <div className="relative w-full h-56 bg-brand-100 rounded-3xl overflow-hidden">
          {plant.photoUrl ? (
            <Image
              src={plant.photoUrl}
              alt={plant.customName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">🌿</span>
            </div>
          )}
          <div className="absolute bottom-3 right-3">
            <Badge variant={healthBadge.variant} size="md">
              {healthBadge.emoji} {healthBadge.text}
            </Badge>
          </div>
        </div>

        {/* Basic info */}
        <div className="card p-4">
          <h2 className="font-bold text-xl text-gray-900">{plant.customName}</h2>
          {plant.plant && (
            <p className="text-brand-600 italic text-sm">{plant.plant.scientificName}</p>
          )}
          {plant.locationInHome && (
            <p className="text-gray-500 text-sm mt-1">📍 {plant.locationInHome}</p>
          )}
          {plant.acquiredDate && (
            <p className="text-gray-500 text-sm">
              🗓️ Adquirida {getRelativeDateLabel(plant.acquiredDate)}
            </p>
          )}
          {plant.notes && (
            <p className="text-gray-600 text-sm mt-2 bg-gray-50 rounded-xl p-3">
              {plant.notes}
            </p>
          )}

          {/* Quick actions */}
          <div className="flex gap-2 mt-4">
            <Link
              href={`/scan?plantId=${plant.id}&mode=diagnose`}
              className="flex-1 btn-secondary text-sm py-2.5 text-center"
            >
              🔬 Diagnosticar
            </Link>
            <Link
              href={`/scan?plantId=${plant.id}&mode=identify`}
              className="flex-1 btn-ghost text-sm py-2.5 text-center border border-gray-200 rounded-2xl"
            >
              📷 Escanear
            </Link>
          </div>
        </div>

        {/* Upcoming care */}
        {plant.reminders.length > 0 && (
          <div className="card p-4">
            <h3 className="font-bold text-gray-900 mb-3">Próximos cuidados</h3>
            <div className="space-y-2">
              {plant.reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-3">
                  <span className="text-xl">{getCareTypeEmoji(reminder.careType as CareType)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getCareTypeLabel(reminder.careType as CareType)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {getRelativeDateLabel(reminder.dueDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Species care requirements */}
        {plant.plant?.careRequirements && (
          <div className="card p-4">
            <h3 className="font-bold text-gray-900 mb-3">Guía de cuidados</h3>
            <div className="grid grid-cols-2 gap-3">
              <CareItem
                emoji="💧"
                label="Riego"
                value={`Cada ${plant.plant.careRequirements.waterFrequencyDays} días`}
              />
              <CareItem
                emoji="☀️"
                label="Luz"
                value={{
                  low: "Poca luz",
                  medium: "Luz media",
                  high: "Mucha luz",
                  direct: "Sol directo",
                }[plant.plant.careRequirements.sunlight] ?? plant.plant.careRequirements.sunlight}
              />
              <CareItem
                emoji="💦"
                label="Humedad"
                value={{
                  low: "Baja",
                  medium: "Media",
                  high: "Alta",
                }[plant.plant.careRequirements.humidity] ?? plant.plant.careRequirements.humidity}
              />
              {plant.plant.careRequirements.tempMin !== null && (
                <CareItem
                  emoji="🌡️"
                  label="Temperatura"
                  value={`${plant.plant.careRequirements.tempMin}–${plant.plant.careRequirements.tempMax}°C`}
                />
              )}
              {plant.plant.careRequirements.soilType && (
                <CareItem
                  emoji="🪨"
                  label="Sustrato"
                  value={plant.plant.careRequirements.soilType}
                />
              )}
              {plant.plant.careRequirements.fertilizeFreqDays && (
                <CareItem
                  emoji="🌱"
                  label="Fertilizar"
                  value={`Cada ${plant.plant.careRequirements.fertilizeFreqDays} días`}
                />
              )}
            </div>
            {plant.plant.careRequirements.notes && (
              <p className="text-sm text-gray-500 mt-3 italic">
                💡 {plant.plant.careRequirements.notes}
              </p>
            )}
          </div>
        )}

        {/* Diagnoses */}
        {plant.diagnoses.length > 0 && (
          <div className="card p-4">
            <h3 className="font-bold text-gray-900 mb-3">Diagnósticos recientes</h3>
            <div className="space-y-3">
              {plant.diagnoses.map((diag) => {
                const issues = JSON.parse(diag.issues) as Array<{ type: string; severity: string; description: string }>;
                return (
                  <div
                    key={diag.id}
                    className={`rounded-xl p-3 border ${
                      diag.severity === "high"
                        ? "bg-red-50 border-red-200"
                        : diag.severity === "medium"
                        ? "bg-honey-50 border-honey-200"
                        : "bg-brand-50 border-brand-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {issues.length === 0 ? "✅ Planta saludable" : `${issues.length} problema${issues.length > 1 ? "s" : ""} detectado${issues.length > 1 ? "s" : ""}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getRelativeDateLabel(diag.createdAt)}
                      </span>
                    </div>
                    {issues.slice(0, 2).map((issue, i) => (
                      <p key={i} className="text-xs text-gray-600 flex items-center gap-1">
                        <span>{getIssueTypeEmoji(issue.type)}</span>
                        <span>{getIssueTypeLabel(issue.type)}</span>
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delete / Archive */}
        <div className="pb-6">
          <ArchivePlantButton plantId={plant.id} />
        </div>
      </div>
    </div>
  );
}

function CareItem({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-0.5">{emoji} {label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}
