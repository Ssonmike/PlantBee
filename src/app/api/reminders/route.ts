import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addDays, startOfDay, endOfDay, addDays as dateAddDays } from "date-fns";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "week"; // today, week, month

  const now = new Date();
  let endDate: Date;

  if (range === "today") {
    endDate = endOfDay(now);
  } else if (range === "week") {
    endDate = addDays(now, 7);
  } else {
    endDate = addDays(now, 30);
  }

  const reminders = await db.reminder.findMany({
    where: {
      userId: session.user.id,
      isDone: false,
      dueDate: { lte: endDate },
    },
    include: {
      userPlant: {
        select: {
          id: true,
          customName: true,
          photoUrl: true,
          healthStatus: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(reminders);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { reminderId, action } = await request.json(); // action: "done" | "snooze"

    const reminder = await db.reminder.findFirst({
      where: { id: reminderId, userId: session.user.id },
      include: { careSchedule: true },
    });

    if (!reminder) {
      return NextResponse.json({ error: "Recordatorio no encontrado" }, { status: 404 });
    }

    if (action === "done") {
      const now = new Date();

      // Mark as done
      await db.reminder.update({
        where: { id: reminderId },
        data: { isDone: true, doneAt: now },
      });

      // Update care schedule's lastDoneAt and nextDueAt
      if (reminder.careScheduleId) {
        const schedule = reminder.careSchedule;
        if (schedule) {
          const nextDue = dateAddDays(now, schedule.adjustedFrequencyDays ?? schedule.frequencyDays);
          await db.careSchedule.update({
            where: { id: schedule.id },
            data: { lastDoneAt: now, nextDueAt: nextDue },
          });

          // Generate next reminder
          await db.reminder.create({
            data: {
              userId: session.user.id,
              userPlantId: reminder.userPlantId,
              careScheduleId: schedule.id,
              careType: reminder.careType,
              dueDate: nextDue,
            },
          });
        }
      }

      return NextResponse.json({ success: true, action: "done" });
    }

    if (action === "snooze") {
      const snoozeUntil = dateAddDays(new Date(), 1); // Snooze 1 day
      await db.reminder.update({
        where: { id: reminderId },
        data: { isSnoozed: true, snoozeUntil },
      });

      return NextResponse.json({ success: true, action: "snoozed", snoozeUntil });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("Reminder action error:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
