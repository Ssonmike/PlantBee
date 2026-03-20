export function getIssueTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    overwatering: "Exceso de riego",
    underwatering: "Falta de riego",
    overexposure: "Exceso de luz",
    underexposure: "Falta de luz",
    pest: "Plaga",
    fungal: "Hongo",
    yellowing: "Hojas amarillas",
    browning: "Hojas marrones",
    wilting: "Marchitamiento",
    rootbound: "Raíces apretadas",
    nutrient_deficiency: "Deficiencia nutricional",
    healthy: "Saludable",
  };
  return labels[type] ?? type;
}

export function getIssueTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    overwatering: "💧",
    underwatering: "🌵",
    overexposure: "☀️",
    underexposure: "🌑",
    pest: "🐛",
    fungal: "🍄",
    yellowing: "🍂",
    browning: "🟤",
    wilting: "😔",
    rootbound: "🪴",
    nutrient_deficiency: "⚗️",
    healthy: "✅",
  };
  return emojis[type] ?? "❓";
}
