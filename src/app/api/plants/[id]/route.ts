import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const plant = await db.userPlant.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      plant: { include: { careRequirements: true } },
      garden: true,
      careSchedules: { orderBy: { careType: "asc" } },
      reminders: {
        where: { isDone: false },
        orderBy: { dueDate: "asc" },
        take: 10,
      },
      diagnoses: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { plantScan: true },
      },
      plantScans: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!plant) {
    return NextResponse.json({ error: "Planta no encontrada" }, { status: 404 });
  }

  return NextResponse.json(plant);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { customName, notes, locationInHome, photoUrl, healthStatus } = body;

    const plant = await db.userPlant.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!plant) {
      return NextResponse.json({ error: "Planta no encontrada" }, { status: 404 });
    }

    const updated = await db.userPlant.update({
      where: { id: params.id },
      data: {
        ...(customName !== undefined && { customName }),
        ...(notes !== undefined && { notes }),
        ...(locationInHome !== undefined && { locationInHome }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(healthStatus !== undefined && { healthStatus }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update plant error:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const plant = await db.userPlant.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!plant) {
    return NextResponse.json({ error: "Planta no encontrada" }, { status: 404 });
  }

  // Soft delete (archive)
  await db.userPlant.update({
    where: { id: params.id },
    data: { isArchived: true },
  });

  return NextResponse.json({ success: true });
}
