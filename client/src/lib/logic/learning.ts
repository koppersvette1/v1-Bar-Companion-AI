// --- Adaptive Learning & Ranking (The "Personalization" Layer) ---

import { Wood, PersonProfile, Recipe } from "../store";

// Feature Weights (Clear & Explicit)
const WEIGHTS = {
  SWEETNESS_MATCH: 15,
  ABV_MATCH: 10,
  TAG_LIKE: 8,
  TAG_DISLIKE: -20, // Strong penalty for dislikes
  SEASONAL_MATCH: 5,
  BASE_SPIRIT_MATCH: 3 // Small bonus if they have liked recipes with this spirit in history
};

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
    score += affinity * 2; // Boost learning weight
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

  // Clone to avoid mutating store
  const ranked = recipes.map(recipe => {
    let score = 0;
    const debugReasons: string[] = [];

    // 1. Sweetness Preference
    let sweetnessScore = 0;
    if (person.sweetnessPref === 'dry') {
      if (recipe.tags.includes('dry') || recipe.tags.includes('bitter') || recipe.tags.includes('aperitif')) {
        sweetnessScore += WEIGHTS.SWEETNESS_MATCH;
      }
      if (recipe.tags.includes('sweet') || recipe.tags.includes('syrupy')) {
        sweetnessScore -= WEIGHTS.SWEETNESS_MATCH; // Penalty
      }
    } else if (person.sweetnessPref === 'sweet') {
      if (recipe.tags.includes('sweet') || recipe.tags.includes('fruity') || recipe.tags.includes('dessert')) {
        sweetnessScore += WEIGHTS.SWEETNESS_MATCH;
      }
      if (recipe.tags.includes('bitter') || recipe.tags.includes('dry')) {
        sweetnessScore -= WEIGHTS.SWEETNESS_MATCH;
      }
    }
    if (sweetnessScore !== 0) {
      score += sweetnessScore;
      debugReasons.push(`Sweetness Pref: ${sweetnessScore > 0 ? '+' : ''}${sweetnessScore}`);
    }

    // 2. ABV Comfort
    let abvScore = 0;
    if (person.abvComfort === 'low') {
      if (recipe.tags.includes('low-abv') || recipe.style === 'low-abv') abvScore += WEIGHTS.ABV_MATCH;
      if (recipe.tags.includes('boozy') || recipe.tags.includes('spirit-forward')) abvScore -= WEIGHTS.ABV_MATCH;
    } else if (person.abvComfort === 'high') {
      if (recipe.tags.includes('boozy') || recipe.tags.includes('spirit-forward')) abvScore += WEIGHTS.ABV_MATCH;
    }
    if (abvScore !== 0) {
      score += abvScore;
      debugReasons.push(`ABV Comfort: ${abvScore > 0 ? '+' : ''}${abvScore}`);
    }

    // 3. Explicit Likes (Tags)
    const liked = recipe.tags.filter(t => person.likedTags.includes(t));
    if (liked.length > 0) {
      const val = liked.length * WEIGHTS.TAG_LIKE;
      score += val;
      debugReasons.push(`Liked Tags (${liked.join(', ')}): +${val}`);
    }

    // 4. Explicit Dislikes (Tags)
    const disliked = recipe.tags.filter(t => person.dislikedTags.includes(t));
    if (disliked.length > 0) {
      const val = disliked.length * Math.abs(WEIGHTS.TAG_DISLIKE); // Penalty is negative
      score += WEIGHTS.TAG_DISLIKE * disliked.length;
      debugReasons.push(`Disliked Tags (${disliked.join(', ')}): -${val}`);
    }

    // 5. Seasonal Context (Simple simulation)
    // In a real app, this would check current month. 
    // For now, if profile says "warm-weather", boost "refreshing"/"summer"
    let seasonalScore = 0;
    if (person.seasonalPref === 'warm-weather') {
      if (recipe.tags.includes('refreshing') || recipe.tags.includes('summer') || recipe.tags.includes('citrus')) {
        seasonalScore += WEIGHTS.SEASONAL_MATCH;
      }
    } else if (person.seasonalPref === 'cool-weather') {
      if (recipe.tags.includes('warming') || recipe.tags.includes('winter') || recipe.tags.includes('spiced')) {
        seasonalScore += WEIGHTS.SEASONAL_MATCH;
      }
    }
    if (seasonalScore !== 0) {
      score += seasonalScore;
      debugReasons.push(`Seasonal Pref: +${seasonalScore}`);
    }

    return {
      ...recipe,
      _score: score,
      _debugReasons: debugReasons
    };
  });

  // Sort Descending by Score
  return ranked.sort((a, b) => (b._score || 0) - (a._score || 0));
}
