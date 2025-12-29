// --- Deterministic Guardrails (The "Safety" Layer) ---

import { Wood, Intensity } from "../store";

export const SMOKER_RULES = {
  // Safety Caps (Seconds)
  caps: {
    'Hickory': 8,
    'Mesquite': 7,
    'Oak': 12,
    'default': 15,
  },
  
  // Method Rules
  methods: {
    glass: "Smoke the glass before pouring. Best for stirred drinks.",
    cocktail: "Smoke the finished drink in a decanter. Use with caution.",
    garnish: "Torch the garnish only. For delicate botanicals."
  },

  // Trouble Shooting
  troubleshooting: [
    { issue: "Too smoky", fix: "Reduce smoke time by 30% or switch to lighter wood (Apple/Alder)." },
    { issue: "Too bitter", fix: "Reduce bitters by 1 dash. Smoke enhances perception of bitterness." },
    { issue: "Flat taste", fix: "Express fresh citrus peel over the top to revive top notes." },
    { issue: "Too sweet", fix: "Add 1 dash of bitters or a few drops of saline solution." },
    { issue: "Harsh/Hot", fix: "Stir longer for more dilution. Smoke needs water to open up." }
  ]
};

export function getSafeSmokeTime(woodName: string, intensity: Intensity): number {
  const cap = SMOKER_RULES.caps[woodName as keyof typeof SMOKER_RULES.caps] || SMOKER_RULES.caps['default'];
  
  // Base times
  let time = 10;
  if (intensity === 'light') time = Math.floor(cap * 0.5);
  else if (intensity === 'medium') time = Math.floor(cap * 0.75);
  else if (intensity === 'bold') time = cap; // Max cap
  else if (intensity === 'very-strong') time = cap; // Cannot exceed cap

  return Math.max(5, time); // Minimum 5s
}

export function validateRecipe(recipe: any): string[] {
  const warnings: string[] = [];
  
  // Check bitters rule
  const bittersCount = recipe.ingredients.filter((i: any) => i.name.toLowerCase().includes('bitters')).length;
  if (recipe.isSmoked && bittersCount > 3) {
    warnings.push("Smoked drinks should have max 3 dashes of bitters total. Reduce bitters by 30-50%.");
  }

  // Check method
  if (recipe.isSmoked && !recipe.steps.some((s: string) => s.toLowerCase().includes('smoke'))) {
    warnings.push("Smoked flag is on, but no smoking step found. Add 'Smoke the glass' to steps.");
  }

  return warnings;
}
