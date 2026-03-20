/**
 * PlantBee Care Engine
 * Core business logic for care scheduling and recommendations.
 *
 * Philosophy: Start with well-tested heuristics, evolve with data.
 * All adjustments are transparent and explainable to the user.
 */

import { addDays, differenceInDays } from "date-fns";
import type { CareAdjustment, WeatherData } from "@/types";

interface AdjustmentFactors {
  temperature: number;
  humidity: number;
  season: number;
  precipitation: number;
}

/**
 * Adjusts watering frequency based on environmental factors.
 * Returns adjusted number of days between waterings.
 *
 * Base rule: more heat → less days between waterings (more frequent)
 *            more humidity/rain → more days between waterings (less frequent)
 */
export function adjustWateringFrequency(
  baseDays: number,
  weather: WeatherData,
  sunlight: string = "medium"
): CareAdjustment {
  const factors: AdjustmentFactors = {
    temperature: 1,
    humidity: 1,
    season: 1,
    precipitation: 1,
  };

  const reasons: string[] = [];

  // Temperature factor
  if (weather.temperature > 30) {
    factors.temperature = 0.7;
    reasons.push("temperatura alta (>30°C)");
  } else if (weather.temperature > 25) {
    factors.temperature = 0.85;
    reasons.push("temperatura cálida");
  } else if (weather.temperature < 10) {
    factors.temperature = 1.4;
    reasons.push("temperatura baja (<10°C)");
  } else if (weather.temperature < 15) {
    factors.temperature = 1.2;
    reasons.push("temperatura fresca");
  }

  // Humidity factor
  if (weather.humidity > 70) {
    factors.humidity = 1.2;
    reasons.push("humedad alta");
  } else if (weather.humidity < 40) {
    factors.humidity = 0.85;
    reasons.push("humedad baja");
  }

  // Seasonal factor
  if (weather.season === "summer") {
    factors.season = 0.8;
    reasons.push("verano (crecimiento activo)");
  } else if (weather.season === "winter") {
    factors.season = 1.3;
    reasons.push("invierno (descanso)");
  } else if (weather.season === "spring") {
    factors.season = 0.9;
    reasons.push("primavera (inicio de temporada)");
  }

  // Precipitation factor (recent rain reduces need for watering)
  if (weather.precipitation > 10) {
    factors.precipitation = 1.3;
    reasons.push("lluvia reciente");
  } else if (weather.precipitation > 5) {
    factors.precipitation = 1.1;
    reasons.push("lluvia ligera reciente");
  }

  // Sunlight exposure increases water needs
  if (sunlight === "direct") {
    factors.temperature *= 0.85;
    reasons.push("exposición directa al sol");
  }

  const totalFactor =
    factors.temperature *
    factors.humidity *
    factors.season *
    factors.precipitation;

  const adjustedDays = Math.max(1, Math.round(baseDays * totalFactor));

  return {
    originalDays: baseDays,
    adjustedDays,
    reason: reasons.length > 0 ? reasons.join(", ") : "condiciones normales",
    factors: reasons,
  };
}

/**
 * Calculates the next due date for a care task.
 * If lastDoneAt is null (never done), defaults to today.
 */
export function calculateNextDueDate(
  frequencyDays: number,
  lastDoneAt: Date | null
): Date {
  const base = lastDoneAt ?? new Date();
  return addDays(base, frequencyDays);
}

/**
 * Determines urgency level of a reminder based on due date.
 */
export function getReminderUrgency(
  dueDate: Date
): "overdue" | "today" | "soon" | "upcoming" {
  const now = new Date();
  const diff = differenceInDays(dueDate, now);

  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 2) return "soon";
  return "upcoming";
}

/**
 * Estimates plant health score based on reminder completion.
 * Returns 0-100.
 */
export function calculateHealthScore(
  overdueCount: number,
  criticalDiagnoses: number,
  totalPlants: number
): number {
  if (totalPlants === 0) return 100;

  let score = 100;
  score -= Math.min(30, overdueCount * 5); // Max 30 points deducted for overdue tasks
  score -= Math.min(40, criticalDiagnoses * 20); // Max 40 points for critical diagnoses

  return Math.max(0, score);
}

/**
 * Gets default care schedule for a plant based on its requirements.
 * Returns list of care types with their frequencies.
 */
export function getDefaultCareSchedules(
  waterFrequencyDays: number,
  fertilizeFreqDays: number | null | undefined
): Array<{ careType: string; frequencyDays: number }> {
  const schedules = [
    { careType: "water", frequencyDays: waterFrequencyDays },
  ];

  if (fertilizeFreqDays) {
    schedules.push({ careType: "fertilize", frequencyDays: fertilizeFreqDays });
  }

  return schedules;
}

/**
 * Generates a personalized care tip based on weather and plant type.
 */
export function generateCareTip(
  weather: WeatherData,
  plantName: string,
  sunlight: string
): string {
  const tips: string[] = [];

  if (weather.temperature > 32) {
    tips.push(`Con estas temperaturas (${weather.temperature}°C), ${plantName} necesitará más agua de lo normal.`);
  }

  if (weather.humidity < 35 && (sunlight === "medium" || sunlight === "high")) {
    tips.push(`La humedad está baja (${weather.humidity}%). Considera nebulizar las hojas de ${plantName}.`);
  }

  if (weather.precipitation > 15) {
    tips.push(`Ha llovido bastante. Si ${plantName} está en exterior, comprueba que el sustrato no esté encharcado.`);
  }

  if (weather.season === "winter") {
    tips.push(`En invierno, reduce la frecuencia de riego y fertilización de ${plantName}.`);
  }

  if (weather.uvIndex > 8 && sunlight !== "direct") {
    tips.push(`UV muy alto hoy. Protege a ${plantName} de la luz directa del mediodía.`);
  }

  return tips[0] ?? `Cuida bien a ${plantName} con las condiciones actuales de ${weather.description.toLowerCase()}.`;
}

/**
 * Evaluates if a plant needs immediate attention.
 */
export function evaluatePlantHealth(
  overdueWaterDays: number,
  hasActiveDiagnosis: boolean,
  diagnosisSeverity?: string
): "good" | "warning" | "critical" {
  if (overdueWaterDays > 7 || (hasActiveDiagnosis && diagnosisSeverity === "high")) {
    return "critical";
  }
  if (overdueWaterDays > 3 || hasActiveDiagnosis) {
    return "warning";
  }
  return "good";
}
