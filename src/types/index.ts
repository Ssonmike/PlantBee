// PlantBee - Shared TypeScript types

export type HealthStatus = "good" | "warning" | "critical";
export type CareType = "water" | "fertilize" | "repot" | "prune" | "mist" | "rotate";
export type ScanType = "identify" | "diagnose";
export type Severity = "low" | "medium" | "high";
export type Sunlight = "low" | "medium" | "high" | "direct";
export type Humidity = "low" | "medium" | "high";
export type CareLevel = "easy" | "medium" | "hard";
export type GardenType = "indoor" | "outdoor" | "balcony" | "mixed";

export interface DiagnosisIssue {
  type: string; // e.g. "overwatering", "pest", "fungal", "yellowing"
  severity: Severity;
  description: string;
}

export interface DiagnosisRecommendation {
  step: number;
  description: string;
  priority: "high" | "medium" | "low";
  timeframe?: string; // e.g. "immediately", "within a week"
}

export interface PlantIdentificationResult {
  scientificName: string;
  commonName: string;
  family?: string;
  confidence: number; // 0-1
  description: string;
  careRequirements: {
    waterFrequencyDays: number;
    sunlight: Sunlight;
    humidity: Humidity;
    tempMin?: number;
    tempMax?: number;
    fertilizeFreqDays?: number;
    soilType?: string;
    notes?: string;
  };
}

export interface PlantDiagnosisResult {
  issues: DiagnosisIssue[];
  overallSeverity: Severity;
  recommendations: DiagnosisRecommendation[];
  disclaimer: string;
  confidence: number;
}

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // %
  precipitation: number; // mm last 24h
  uvIndex: number;
  windSpeed: number;
  description: string;
  season: "spring" | "summer" | "autumn" | "winter";
}

export interface CareAdjustment {
  originalDays: number;
  adjustedDays: number;
  reason: string;
  factors: string[];
}

// Dashboard types
export interface TodayTask {
  id: string;
  plantName: string;
  plantPhoto?: string;
  careType: CareType;
  dueDate: string;
  isDone: boolean;
  urgency: "overdue" | "today" | "soon";
  userPlantId: string;
  reminderId: string;
}

export interface DashboardData {
  todayTasks: TodayTask[];
  upcomingTasks: TodayTask[];
  plantsNeedingAttention: number;
  gardenHealth: number; // 0-100
}
