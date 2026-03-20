import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { getHealthStatusColor, getHealthStatusLabel } from "@/lib/utils";

export const metadata = { title: "Mi Jardín" };

export default async function GardenPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const plants = await db.userPlant.findMany({
    where: { userId: session.user.id, isArchived: false },
    include: {
      plant: true,
      reminders: {
        where: { isDone: false },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
      diagnoses: {
        where: { isResolved: false },
        take: 1,
      },
    },
    orderBy: [{ healthStatus: "asc" }, { createdAt: "desc" }],
  });

  const criticalCount = plants.filter((p) => p.healthStatus === "critical").length;
  const warningCount = plants.filter((p) => p.healthStatus === "warning").length;

  return (
    <div>
      <Header
        title="Mi Jardín"
        subtitle={`${plants.length} planta${plants.length !== 1 ? "s" : ""}`}
        action={
          <Link
            href="/garden/add"
            className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-sm"
            aria-label="Añadir planta"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        }
      />

      <div className="px-4 py-4">
        {/* Alert banner */}
        {(criticalCount > 0 || warningCount > 0) && (
          <div className="bg-honey-50 border border-honey-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-semibold text-honey-800 text-sm">
                {criticalCount > 0 && `${criticalCount} planta${criticalCount > 1 ? "s" : ""} necesitan atención urgente`}
                {criticalCount > 0 && warningCount > 0 && " y "}
                {warningCount > 0 && `${warningCount} con advertencias`}
              </p>
              <p className="text-xs text-honey-600 mt-0.5">
                Revisa el diagnóstico para ver qué necesitan.
              </p>
            </div>
          </div>
        )}

        {plants.length === 0 ? (
          <EmptyGarden />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlantCard({ plant }: { plant: any }) {
  const nextReminder = plant.reminders[0];
  const hasDiagnosis = plant.diagnoses.length > 0;

  return (
    <Link
      href={`/garden/${plant.id}`}
      className="card overflow-hidden touch-feedback"
    >
      {/* Photo */}
      <div className="relative w-full h-36 bg-brand-50">
        {plant.photoUrl ? (
          <Image
            src={plant.photoUrl}
            alt={plant.customName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🌿</span>
          </div>
        )}

        {/* Health badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`badge text-xs ${
              plant.healthStatus === "good"
                ? "bg-brand-100 text-brand-700"
                : plant.healthStatus === "warning"
                ? "bg-honey-100 text-honey-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {plant.healthStatus === "good" ? "✓" : plant.healthStatus === "warning" ? "!" : "!!"}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-bold text-gray-900 text-sm truncate">{plant.customName}</p>
        {plant.plant && (
          <p className="text-xs text-gray-500 truncate italic">{plant.plant.scientificName}</p>
        )}

        {nextReminder && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs">💧</span>
            <span className="text-xs text-brand-600 font-medium">
              {isToday(new Date(nextReminder.dueDate))
                ? "Regar hoy"
                : `En ${Math.ceil((new Date(nextReminder.dueDate).getTime() - Date.now()) / 86400000)}d`}
            </span>
          </div>
        )}

        {hasDiagnosis && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-xs">🔬</span>
            <span className="text-xs text-honey-600 font-medium">Ver diagnóstico</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function EmptyGarden() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🪴</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Tu jardín está vacío</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
        Añade tus plantas para empezar a recibir recordatorios y cuidados personalizados.
      </p>
      <div className="flex flex-col gap-3 items-center">
        <Link href="/scan" className="btn-primary">
          📷 Identificar con cámara
        </Link>
        <Link href="/garden/add" className="btn-secondary">
          ➕ Añadir manualmente
        </Link>
      </div>
    </div>
  );
}
