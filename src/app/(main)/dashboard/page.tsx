import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format, isToday, isTomorrow, isPast, startOfDay, endOfDay, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { getCareTypeEmoji, getCareTypeLabel, getHealthStatusColor } from "@/lib/utils";
import type { CareType } from "@/types";
import DashboardTaskCard from "@/components/dashboard/DashboardTaskCard";
import WeatherWidget from "@/components/dashboard/WeatherWidget";

export const metadata = { title: "Inicio" };

async function getDashboardData(userId: string) {
  const now = new Date();
  const todayEnd = endOfDay(now);
  const weekEnd = addDays(now, 7);

  const [todayReminders, upcomingReminders, plants, locationProfile] = await Promise.all([
    db.reminder.findMany({
      where: {
        userId,
        isDone: false,
        isSnoozed: false,
        dueDate: { lte: todayEnd },
      },
      include: {
        userPlant: { select: { id: true, customName: true, photoUrl: true, healthStatus: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    db.reminder.findMany({
      where: {
        userId,
        isDone: false,
        isSnoozed: false,
        dueDate: { gt: todayEnd, lte: weekEnd },
      },
      include: {
        userPlant: { select: { id: true, customName: true, photoUrl: true, healthStatus: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    db.userPlant.findMany({
      where: { userId, isArchived: false },
      select: { healthStatus: true },
    }),
    db.locationProfile.findUnique({ where: { userId } }),
  ]);

  const criticalPlants = plants.filter((p) => p.healthStatus === "critical").length;
  const warningPlants = plants.filter((p) => p.healthStatus === "warning").length;

  return {
    todayReminders,
    upcomingReminders,
    totalPlants: plants.length,
    criticalPlants,
    warningPlants,
    locationProfile,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(session.user.id);
  const now = new Date();
  const greeting = getGreeting();
  const firstName = session.user.name?.split(" ")[0] ?? "Jardinero";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 gradient-brand">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-brand-100 text-sm font-medium">
                {format(now, "EEEE, d MMMM", { locale: es })}
              </p>
              <h1 className="text-white text-2xl font-bold mt-0.5">
                {greeting}, {firstName} 🌿
              </h1>
            </div>
            <Link
              href="/profile"
              className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">
                {firstName[0]?.toUpperCase()}
              </span>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-2 mb-2">
            <StatCard
              label="Plantas"
              value={data.totalPlants}
              emoji="🌿"
              href="/garden"
            />
            <StatCard
              label="Hoy"
              value={data.todayReminders.length}
              emoji="📋"
              highlight={data.todayReminders.length > 0}
            />
            <StatCard
              label="Urgentes"
              value={data.criticalPlants + data.warningPlants}
              emoji="⚠️"
              highlight={data.criticalPlants > 0}
              href="/garden"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        {/* Weather widget */}
        {data.locationProfile && (
          <WeatherWidget
            lat={data.locationProfile.latitude}
            lng={data.locationProfile.longitude}
            city={data.locationProfile.city}
          />
        )}

        {/* Today's tasks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">
              Para hoy
              {data.todayReminders.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({data.todayReminders.length})
                </span>
              )}
            </h2>
            <Link href="/calendar" className="text-sm text-brand-600 font-medium">
              Ver todo →
            </Link>
          </div>

          {data.todayReminders.length === 0 ? (
            <EmptyState
              emoji="✅"
              title="Todo al día"
              description="No tienes tareas para hoy. ¡Buen trabajo!"
            />
          ) : (
            <div className="space-y-3">
              {data.todayReminders.map((reminder) => (
                <DashboardTaskCard
                  key={reminder.id}
                  reminderId={reminder.id}
                  userPlantId={reminder.userPlant.id}
                  plantName={reminder.userPlant.customName}
                  plantPhoto={reminder.userPlant.photoUrl}
                  careType={reminder.careType as CareType}
                  dueDate={reminder.dueDate.toISOString()}
                  urgency={isPast(reminder.dueDate) ? "overdue" : "today"}
                />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming tasks */}
        {data.upcomingReminders.length > 0 && (
          <section>
            <h2 className="section-title">Próximamente</h2>
            <div className="space-y-2">
              {data.upcomingReminders.slice(0, 5).map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center gap-3 px-4 py-3 card"
                >
                  <span className="text-xl">
                    {getCareTypeEmoji(reminder.careType as CareType)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {reminder.userPlant.customName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getCareTypeLabel(reminder.careType as CareType)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 flex-shrink-0">
                    {isToday(reminder.dueDate)
                      ? "Hoy"
                      : isTomorrow(reminder.dueDate)
                      ? "Mañana"
                      : format(reminder.dueDate, "dd MMM", { locale: es })}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty garden CTA */}
        {data.totalPlants === 0 && (
          <div className="card p-6 text-center">
            <div className="text-5xl mb-3">🪴</div>
            <h3 className="font-bold text-gray-900 mb-2">¡Añade tu primera planta!</h3>
            <p className="text-sm text-gray-500 mb-4">
              Escanea una planta con la cámara o añádela manualmente.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/scan" className="btn-primary text-sm py-2.5 px-4">
                📷 Escanear
              </Link>
              <Link href="/garden/add" className="btn-secondary text-sm py-2.5 px-4">
                ➕ Añadir
              </Link>
            </div>
          </div>
        )}

        {/* Quick scan CTA */}
        {data.totalPlants > 0 && (
          <Link
            href="/scan"
            className="card p-4 flex items-center gap-4 border-2 border-brand-100 hover:border-brand-300 transition-colors"
          >
            <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📷</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Escanear planta</p>
              <p className="text-sm text-gray-500">Identifica o diagnostica</p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 ml-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  emoji,
  href,
  highlight = false,
}: {
  label: string;
  value: number;
  emoji: string;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={`bg-white/20 rounded-2xl p-3 text-center ${
        highlight && value > 0 ? "bg-white/30 ring-2 ring-white/40" : ""
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <p className="text-white font-bold text-lg leading-tight">{value}</p>
      <p className="text-brand-100 text-xs font-medium">{label}</p>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

function EmptyState({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-6 text-center">
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}
