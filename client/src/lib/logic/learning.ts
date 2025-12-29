// --- Adaptive Learning & Ranking (The "Personalization" Layer) ---

import { Wood, PersonProfile, Recipe } from "../store";

// Score a wood for a specific context
export function scoreWoodForContext(
  wood: Wood,
  context: {
    mealTags?: string[];
    drinkTags?: string[];
    userAffinity?: Record<string, number>;
  }
): { score: number; reason: string } {
  let score = 0;
  let reasons: string[] = [];

  // 1. Tag Matching (Deterministic)
  if (context.drinkTags) {
    const matches = wood.bestWithDrinkTags.filter(t => context.drinkTags!.includes(t));
    if (matches.length > 0) {
      score += matches.length * 2;
      reasons.push(`Matches drink style (${matches.join(', ')})`);
    }
    
    const conflicts = wood.avoidWithDrinkTags.filter(t => context.drinkTags!.includes(t));
    if (conflicts.length > 0) {
      score -= conflicts.length * 3;
      // reasons.push(`Avoid with ${conflicts.join(', ')}`); 
    }
  }

  if (context.mealTags) {
    const matches = wood.bestWithFoodTags.filter(t => context.mealTags!.includes(t));
    if (matches.length > 0) {
      score += matches.length * 2;
      reasons.push(`Pairs with meal (${matches.join(', ')})`);
    }
  }

  // 2. Personal Affinity (Learned)
  if (context.userAffinity && context.userAffinity[wood.name]) {
    const affinity = context.userAffinity[wood.name];
    score += affinity;
    if (affinity > 0) reasons.push("Based on your history");
  }

  // 3. Kit Availability (Practicality)
  if (wood.isInMyKit) {
    score += 1;
  } else {
    score -= 0.5; // Slight penalty if not owned, but still suggest if perfect match
  }

  return { score, reason: reasons.join('. ') };
}

// Rank recipes for a person
export function rankRecipesForPerson(
  recipes: Recipe[],
  person: PersonProfile | null
): Recipe[] {
  if (!person) return recipes;

  return [...recipes].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Sweetness match
    if (person.sweetnessPref === 'dry') {
      if (a.tags.includes('dry') || a.tags.includes('bitter')) scoreA += 2;
      if (b.tags.includes('dry') || b.tags.includes('bitter')) scoreB += 2;
    } else if (person.sweetnessPref === 'sweet') {
      if (a.tags.includes('sweet') || a.tags.includes('fruity')) scoreA += 2;
      if (b.tags.includes('sweet') || b.tags.includes('fruity')) scoreB += 2;
    }

    // Tag Likes/Dislikes
    scoreA += a.tags.filter(t => person.likedTags.includes(t)).length;
    scoreA -= a.tags.filter(t => person.dislikedTags.includes(t)).length * 2;

    scoreB += b.tags.filter(t => person.likedTags.includes(t)).length;
    scoreB -= b.tags.filter(t => person.dislikedTags.includes(t)).length * 2;

    return scoreB - scoreA;
  });
}
