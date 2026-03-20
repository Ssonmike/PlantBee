import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Climate zones by latitude
function getClimateZone(lat: number): string {
  const absLat = Math.abs(lat);
  if (absLat < 10) return "tropical";
  if (absLat < 23.5) return "subtropical";
  if (absLat < 35) return "mediterranean";
  if (absLat < 55) return "temperate";
  if (absLat < 70) return "continental";
  return "polar";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { latitude, longitude, city, country, countryCode } = await request.json();

    const climateZone = getClimateZone(latitude);

    const profile = await db.locationProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        latitude,
        longitude,
        city,
        country,
        countryCode,
        climateZone,
      },
      update: {
        latitude,
        longitude,
        city,
        country,
        countryCode,
        climateZone,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Location save error:", error);
    return NextResponse.json({ error: "Error al guardar ubicación" }, { status: 500 });
  }
}
