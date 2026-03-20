/**
 * PlantBee AI Module
 * Uses Claude claude-sonnet-4-6 (with vision) for plant identification and diagnosis.
 *
 * Design principle: Claude is our AI backbone for the MVP.
 * Future: Add Plant.id API as specialist layer, then fine-tune own model.
 */

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { PlantIdentificationResult, PlantDiagnosisResult } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const IDENTIFICATION_PROMPT = `You are an expert botanist and plant identification specialist.
Analyze the provided plant image and identify the species.

Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "scientificName": "Species name",
  "commonName": "Common name in Spanish",
  "family": "Plant family",
  "confidence": 0.85,
  "description": "Brief description (2-3 sentences) in Spanish",
  "careRequirements": {
    "waterFrequencyDays": 7,
    "sunlight": "medium",
    "humidity": "medium",
    "tempMin": 15,
    "tempMax": 30,
    "fertilizeFreqDays": 30,
    "soilType": "well-draining",
    "notes": "Additional care note in Spanish"
  }
}

Rules:
- confidence: 0-1 float (be honest - if unsure, use lower value)
- sunlight: one of "low", "medium", "high", "direct"
- humidity: one of "low", "medium", "high"
- waterFrequencyDays: integer (days between waterings under normal conditions)
- If you cannot identify the plant, use confidence: 0.1 and fill with best guess
- All text fields in Spanish`;

const DIAGNOSIS_PROMPT = `You are an expert plant pathologist and horticulturist.
Analyze the provided plant image and diagnose any visible health problems.

IMPORTANT: Be conservative. Only report problems you can clearly see.
This diagnosis is ORIENTATIVE - always recommend consulting an expert for serious issues.

Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "issues": [
    {
      "type": "overwatering",
      "severity": "medium",
      "description": "Description of what you see (in Spanish)"
    }
  ],
  "overallSeverity": "medium",
  "confidence": 0.75,
  "recommendations": [
    {
      "step": 1,
      "description": "Specific action to take (in Spanish)",
      "priority": "high",
      "timeframe": "Immediately"
    }
  ],
  "disclaimer": "Este diagnóstico es orientativo. Para problemas graves, consulta con un experto en plantas."
}

Issue types (use exact strings): overwatering, underwatering, overexposure, underexposure,
pest, fungal, yellowing, browning, wilting, rootbound, nutrient_deficiency, healthy

Severity: "low", "medium", "high"
Overall severity: "low", "medium", "high"
Priority: "high", "medium", "low"
confidence: 0-1 float

If the plant looks healthy, return issues: [] and overallSeverity: "low"
Maximum 5 issues, maximum 6 recommendations.
All text in Spanish.`;

export async function identifyPlant(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<PlantIdentificationResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
            },
          },
          {
            type: "text",
            text: IDENTIFICATION_PROMPT,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");

  const result = JSON.parse(content.text) as PlantIdentificationResult;
  return result;
}

export async function diagnosePlant(
  imageBase64: string,
  plantName?: string,
  mimeType: string = "image/jpeg"
): Promise<PlantDiagnosisResult> {
  const contextNote = plantName
    ? `\n\nNote: This is a ${plantName}. Take the species into account for your diagnosis.`
    : "";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
            },
          },
          {
            type: "text",
            text: DIAGNOSIS_PROMPT + contextNote,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");

  const result = JSON.parse(content.text) as PlantDiagnosisResult;
  return result;
}

export { getIssueTypeLabel, getIssueTypeEmoji } from "./plant-utils";
