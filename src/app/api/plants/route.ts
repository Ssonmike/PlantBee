import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addDays } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const plants = await db.userPlant.findMany({
    where: { userId: session.user.id, isArchived: false },
    include: {
      plant: { include: { careRequirements: true } },
      garden: true,
      careSchedules: true,
      reminders: {
        where: { isDone: false },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
      diagnoses: {
        where: { isResolved: false },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(plants);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      customName,
      plantId,
      gardenId,
      photoUrl,
      locationInHome,
      notes,
      acquiredDate,
      waterFrequencyDays = 7,
      fertilizeFreqDays,
      sunlight = "medium",
    } = body;

    if (!customName) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    // Get user's first garden if none specified
    let resolvedGardenId = gardenId;
    if (!resolvedGardenId) {
      const defaultGarden = await db.garden.findFirst({
        where: { userId: session.user.id },
      });
      resolvedGardenId = defaultGarden?.id;
    }

    const userPlant = await db.userPlant.create({
      data: {
        userId: session.user.id,
        gardenId: resolvedGardenId,
        plantId: plantId ?? null,
        customName,
        photoUrl: photoUrl ?? null,
        locationInHome: locationInHome ?? null,
        notes: notes ?? null,
        acquiredDate: acquiredDate ? new Date(acquiredDate) : null,
        healthStatus: "good",
      },
    });

    // Create care schedules
    const now = new Date();
    const schedules = [];

    // Water schedule
    const waterSchedule = await db.careSchedule.create({
      data: {
        userPlantId: userPlant.id,
        careType: "water",
        frequencyDays: waterFrequencyDays,
        lastDoneAt: null,
        nextDueAt: addDays(now, waterFrequencyDays),
        isActive: true,
      },
    });
    schedules.push(waterSchedule);

    // Fertilize schedule (if specified)
    let fertilizeSchedule = null;
    if (fertilizeFreqDays) {
      fertilizeSchedule = await db.careSchedule.create({
        data: {
          userPlantId: userPlant.id,
          careType: "fertilize",
          frequencyDays: fertilizeFreqDays,
          lastDoneAt: null,
          nextDueAt: addDays(now, fertilizeFreqDays),
          isActive: true,
        },
      });
      schedules.push(fertilizeSchedule);
    }

    // Generate upcoming reminders (next 8 occurrences)
    const reminderData = [];
    for (const schedule of schedules) {
      for (let i = 0; i < 8; i++) {
        reminderData.push({
          userId: session.user.id,
          userPlantId: userPlant.id,
          careScheduleId: schedule.id,
          careType: schedule.careType,
          dueDate: addDays(now, schedule.frequencyDays * (i + 1)),
        });
      }
    }

    if (reminderData.length > 0) {
      await db.reminder.createMany({ data: reminderData });
    }

    return NextResponse.json(
      { ...userPlant, careSchedules: schedules },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create plant error:", error);
    return NextResponse.json({ error: "Error al crear la planta" }, { status: 500 });
  }
}
