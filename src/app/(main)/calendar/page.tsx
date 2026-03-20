import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { format, startOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import Header from "@/components/layout/Header";
import CalendarView from "@/components/calendar/CalendarView";

export const metadata = { title: "Calendario" };

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const monthEnd = addDays(now, 30);

  const reminders = await db.reminder.findMany({
    where: {
      userId: session.user.id,
      isDone: false,
      dueDate: { lte: monthEnd },
    },
    include: {
      userPlant: {
        select: { id: true, customName: true, photoUrl: true, healthStatus: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const serializedReminders = reminders.map((r) => ({
    ...r,
    dueDate: r.dueDate.toISOString(),
    snoozeUntil: r.snoozeUntil?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    doneAt: r.doneAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <Header title="Calendario de cuidados" />
      <CalendarView initialReminders={serializedReminders} />
    </div>
  );
}
