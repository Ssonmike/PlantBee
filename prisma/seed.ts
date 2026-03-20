/**
 * PlantBee Database Seed
 * Seeds common plants with care requirements for the initial catalog.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const commonPlants = [
  {
    scientificName: "Monstera deliciosa",
    commonName: "Costilla de Adán",
    family: "Araceae",
    careLevel: "easy",
    description:
      "Planta tropical de grandes hojas perforadas. Muy popular en decoración de interiores. Resistente y de crecimiento moderado.",
    careRequirements: {
      waterFrequencyDays: 7,
      sunlight: "medium",
      humidity: "high",
      tempMin: 18,
      tempMax: 30,
      fertilizeFreqDays: 30,
      soilType: "well-draining",
      notes: "Limpia las hojas con un paño húmedo. Tutora cuando crezca.",
    },
  },
  {
    scientificName: "Sansevieria trifasciata",
    commonName: "Lengua de suegra",
    family: "Asparagaceae",
    careLevel: "easy",
    description:
      "Planta extremadamente resistente y purificadora de aire. Tolera el descuido y la poca luz. Ideal para principiantes.",
    careRequirements: {
      waterFrequencyDays: 14,
      sunlight: "low",
      humidity: "low",
      tempMin: 10,
      tempMax: 35,
      fertilizeFreqDays: 60,
      soilType: "well-draining",
      notes: "Aguanta el olvido, pero odia el exceso de agua. Substrato muy drenante.",
    },
  },
  {
    scientificName: "Epipremnum aureum",
    commonName: "Potus",
    family: "Araceae",
    careLevel: "easy",
    description:
      "Planta trepadora con hojas en forma de corazón. Purifica el aire y se adapta a casi cualquier condición de luz.",
    careRequirements: {
      waterFrequencyDays: 7,
      sunlight: "low",
      humidity: "medium",
      tempMin: 15,
      tempMax: 30,
      fertilizeFreqDays: 30,
      soilType: "well-draining",
      notes: "Poda regularmente para mantener la forma. Muy fácil de propagar en agua.",
    },
  },
  {
    scientificName: "Ficus lyrata",
    commonName: "Ficus lira",
    family: "Moraceae",
    careLevel: "medium",
    description:
      "Árbol interior de hojas grandes con forma de violín. Elegante pero algo exigente: no tolera los cambios de ubicación.",
    careRequirements: {
      waterFrequencyDays: 7,
      sunlight: "high",
      humidity: "medium",
      tempMin: 16,
      tempMax: 28,
      fertilizeFreqDays: 30,
      soilType: "well-draining",
      notes: "No muevas la planta una vez ubicada. Evita corrientes de aire frío.",
    },
  },
  {
    scientificName: "Cactus mix",
    commonName: "Cactus",
    family: "Cactaceae",
    careLevel: "easy",
    description:
      "Plantas suculentas del desierto, extremadamente tolerantes a la sequía. Requieren muy poco cuidado y mucha luz directa.",
    careRequirements: {
      waterFrequencyDays: 14,
      sunlight: "direct",
      humidity: "low",
      tempMin: 5,
      tempMax: 40,
      fertilizeFreqDays: 90,
      soilType: "sandy",
      notes: "En invierno, riega solo una vez al mes. Substrato especial para cactus.",
    },
  },
  {
    scientificName: "Spathiphyllum wallisii",
    commonName: "Espatifilo / Lirio de paz",
    family: "Araceae",
    careLevel: "easy",
    description:
      "Planta con flores blancas muy elegante. Purificadora de aire. Indica claramente cuando necesita agua (se cae un poco).",
    careRequirements: {
      waterFrequencyDays: 5,
      sunlight: "low",
      humidity: "high",
      tempMin: 15,
      tempMax: 30,
      fertilizeFreqDays: 30,
      soilType: "moist",
      notes: "Nebuliza las hojas regularmente. Si las hojas amarillean, reduce el riego.",
    },
  },
  {
    scientificName: "Zamioculcas zamiifolia",
    commonName: "ZZ Plant",
    family: "Araceae",
    careLevel: "easy",
    description:
      "Planta de interior de brillantes hojas verdes. Tolera bien la sequía y la poca luz. Crece lentamente pero con muy poco mantenimiento.",
    careRequirements: {
      waterFrequencyDays: 14,
      sunlight: "low",
      humidity: "low",
      tempMin: 15,
      tempMax: 30,
      fertilizeFreqDays: 60,
      soilType: "well-draining",
      notes: "Sus rizomas almacenan agua. Más fácil matarla por exceso de riego que por déficit.",
    },
  },
  {
    scientificName: "Aloe barbadensis miller",
    commonName: "Aloe Vera",
    family: "Asphodelaceae",
    careLevel: "easy",
    description:
      "Suculenta medicinal con gel en sus hojas. Muy popular por sus propiedades curativas. Requiere poca agua y mucha luz.",
    careRequirements: {
      waterFrequencyDays: 14,
      sunlight: "high",
      humidity: "low",
      tempMin: 10,
      tempMax: 35,
      fertilizeFreqDays: 60,
      soilType: "sandy",
      notes: "Usa el gel de sus hojas para quemaduras o piel irritada. Substrato drenante.",
    },
  },
];

async function main() {
  console.log("🌱 Seeding PlantBee database...");

  // Create plants
  for (const plant of commonPlants) {
    const { careRequirements, ...plantData } = plant;
    await db.plant.upsert({
      where: { scientificName: plant.scientificName },
      update: {},
      create: {
        ...plantData,
        careRequirements: {
          create: careRequirements,
        },
      },
    });
  }

  console.log(`✅ Created ${commonPlants.length} plants in catalog`);

  // Create demo user
  const demoEmail = "demo@plantbee.app";
  const existingUser = await db.user.findUnique({ where: { email: demoEmail } });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("demo1234", 12);
    const user = await db.user.create({
      data: {
        email: demoEmail,
        name: "Usuario Demo",
        password: hashedPassword,
      },
    });

    const garden = await db.garden.create({
      data: { userId: user.id, name: "Mi Jardín", type: "mixed", emoji: "🌿" },
    });

    // Add some demo plants
    const monstera = await db.plant.findUnique({ where: { scientificName: "Monstera deliciosa" } });
    const pothos = await db.plant.findUnique({ where: { scientificName: "Epipremnum aureum" } });

    if (monstera) {
      const now = new Date();
      const up1 = await db.userPlant.create({
        data: {
          userId: user.id,
          gardenId: garden.id,
          plantId: monstera.id,
          customName: "Mi Monstera",
          locationInHome: "Salón",
          healthStatus: "good",
        },
      });

      const sched1 = await db.careSchedule.create({
        data: {
          userPlantId: up1.id,
          careType: "water",
          frequencyDays: 7,
          nextDueAt: new Date(now.getTime() + 3 * 86400000),
        },
      });

      await db.reminder.createMany({
        data: [1, 8, 15, 22].map((days) => ({
          userId: user.id,
          userPlantId: up1.id,
          careScheduleId: sched1.id,
          careType: "water",
          dueDate: new Date(now.getTime() + days * 86400000),
        })),
      });
    }

    if (pothos) {
      const now = new Date();
      const up2 = await db.userPlant.create({
        data: {
          userId: user.id,
          gardenId: garden.id,
          plantId: pothos.id,
          customName: "Potus de la entrada",
          locationInHome: "Entrada",
          healthStatus: "good",
        },
      });

      const sched2 = await db.careSchedule.create({
        data: {
          userPlantId: up2.id,
          careType: "water",
          frequencyDays: 7,
          nextDueAt: now, // Due today for demo
        },
      });

      await db.reminder.createMany({
        data: [0, 7, 14, 21].map((days) => ({
          userId: user.id,
          userPlantId: up2.id,
          careScheduleId: sched2.id,
          careType: "water",
          dueDate: new Date(now.getTime() + days * 86400000),
        })),
      });
    }

    console.log(`✅ Created demo user: ${demoEmail} / demo1234`);
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
