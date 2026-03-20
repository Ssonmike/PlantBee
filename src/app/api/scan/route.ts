import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { identifyPlant, diagnosePlant } from "@/lib/ai";

export const maxDuration = 30; // 30 seconds timeout for AI calls

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "API de IA no configurada. Añade ANTHROPIC_API_KEY en .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { imageBase64, scanType = "identify", userPlantId, mimeType = "image/jpeg" } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });
    }

    // Save scan record
    const scan = await db.plantScan.create({
      data: {
        userId: session.user.id,
        userPlantId: userPlantId ?? null,
        imageUrl: imageBase64.substring(0, 100) + "...", // Store reference, not full base64
        scanType,
      },
    });

    if (scanType === "identify") {
      const result = await identifyPlant(imageBase64, mimeType);

      // Try to find or create plant in catalog
      let plant = await db.plant.findFirst({
        where: {
          OR: [
            { scientificName: { contains: result.scientificName } },
            { commonName: { contains: result.commonName } },
          ],
        },
      });

      if (!plant) {
        plant = await db.plant.create({
          data: {
            scientificName: result.scientificName,
            commonName: result.commonName,
            family: result.family ?? null,
            description: result.description,
            careRequirements: {
              create: {
                waterFrequencyDays: result.careRequirements.waterFrequencyDays,
                sunlight: result.careRequirements.sunlight,
                humidity: result.careRequirements.humidity,
                tempMin: result.careRequirements.tempMin ?? null,
                tempMax: result.careRequirements.tempMax ?? null,
                fertilizeFreqDays: result.careRequirements.fertilizeFreqDays ?? null,
                soilType: result.careRequirements.soilType ?? null,
                notes: result.careRequirements.notes ?? null,
              },
            },
          },
        });
      }

      // Update scan with result
      await db.plantScan.update({
        where: { id: scan.id },
        data: {
          rawResponse: JSON.stringify(result),
          identifiedPlantId: plant.id,
          confidenceScore: result.confidence,
        },
      });

      return NextResponse.json({
        scanId: scan.id,
        type: "identify",
        result,
        plantId: plant.id,
      });
    }

    if (scanType === "diagnose") {
      // Get plant name if userPlantId is provided
      let plantName: string | undefined;
      if (userPlantId) {
        const userPlant = await db.userPlant.findFirst({
          where: { id: userPlantId, userId: session.user.id },
          include: { plant: true },
        });
        plantName = userPlant?.plant?.commonName ?? userPlant?.customName;
      }

      const result = await diagnosePlant(imageBase64, plantName, mimeType);

      // Update scan
      await db.plantScan.update({
        where: { id: scan.id },
        data: {
          rawResponse: JSON.stringify(result),
          confidenceScore: result.confidence,
        },
      });

      // Save diagnosis
      const diagnosis = await db.diagnosis.create({
        data: {
          plantScanId: scan.id,
          userPlantId: userPlantId ?? null,
          issues: JSON.stringify(result.issues),
          severity: result.overallSeverity,
          recommendations: JSON.stringify(result.recommendations),
        },
      });

      // Update plant health status if critical
      if (userPlantId && result.overallSeverity === "high") {
        await db.userPlant.update({
          where: { id: userPlantId },
          data: { healthStatus: "critical" },
        });
      } else if (userPlantId && result.overallSeverity === "medium") {
        await db.userPlant.update({
          where: { id: userPlantId },
          data: { healthStatus: "warning" },
        });
      }

      return NextResponse.json({
        scanId: scan.id,
        diagnosisId: diagnosis.id,
        type: "diagnose",
        result,
      });
    }

    return NextResponse.json({ error: "Tipo de escaneo no válido" }, { status: 400 });
  } catch (error) {
    console.error("Scan error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Error al procesar la respuesta de IA. Intenta con otra imagen." },
        { status: 422 }
      );
    }
    return NextResponse.json({ error: "Error al procesar la imagen" }, { status: 500 });
  }
}
