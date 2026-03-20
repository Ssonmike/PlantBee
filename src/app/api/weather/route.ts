import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWeatherData } from "@/lib/weather";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lng = parseFloat(searchParams.get("lng") ?? "0");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Coordenadas requeridas" }, { status: 400 });
  }

  const weather = await getWeatherData(lat, lng);

  if (!weather) {
    return NextResponse.json({ error: "No se pudo obtener el clima" }, { status: 503 });
  }

  return NextResponse.json(weather);
}
