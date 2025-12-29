import { Item, Wood, UserSettings } from "@/lib/store";
import cocktailImage from '@assets/generated_images/classic_old_fashioned_cocktail.png';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  baseSpirit: string;
  style: 'classic' | 'modern' | 'tiki' | 'smoky' | 'low-abv';
  ingredients: string[];
  steps: string[];
  glassware: string;
  garnish: string;
  isSmoked: boolean;
  recommendedWood?: string;
  smokeTime?: number;
  tags: string[];
  matchScore?: number; // 0-100
  missingIngredients?: string[];
  estimatedCost?: number;
  missingCost?: boolean;
}

// --- Knowledge Base ---

const CLASSIC_RECIPES: Recipe[] = [
  {
    id: 'old-fashioned',
    name: "Classic Old Fashioned",
    description: "The definition of a cocktail: spirits, sugar, water, and bitters.",
    image: cocktailImage,
    baseSpirit: "Whiskey",
    style: "classic",
    ingredients: ["2oz Bourbon or Rye", "0.25oz Simple Syrup", "2 dashes Angostura Bitters"],
    steps: ["Stir all ingredients with ice.", "Strain into rocks glass over large cube.", "Express orange peel."],
    glassware: "Rocks",
    garnish: "Orange Peel",
    isSmoked: false,
    tags: ["boozy", "bitter", "sweet", "dinner"],
  },
  {
    id: 'smoked-old-fashioned',
    name: "Campfire Old Fashioned",
    description: "A rich, smoky twist on the classic. The smoke adds a savory depth.",
    image: cocktailImage,
    baseSpirit: "Whiskey",
    style: "smoky",
    ingredients: ["2oz Bourbon", "0.25oz Maple Syrup", "2 dashes Angostura Bitters"],
    steps: ["Smoke the glass with wood chips.", "Stir ingredients with ice.", "Strain into smoked glass.", "Garnish."],
    glassware: "Rocks",
    garnish: "Luxardo Cherry",
    isSmoked: true,
    recommendedWood: "Hickory",
    smokeTime: 8,
    tags: ["smoky", "boozy", "rich", "winter"],
  },
  {
    id: 'negroni',
    name: "Negroni",
    description: "The perfect balance of bitter, sweet, and botanical.",
    image: cocktailImage,
    baseSpirit: "Gin",
    style: "classic",
    ingredients: ["1oz Gin", "1oz Campari", "1oz Sweet Vermouth"],
    steps: ["Stir with ice.", "Strain into rocks glass.", "Garnish."],
    glassware: "Rocks",
    garnish: "Orange Peel",
    isSmoked: false,
    tags: ["bitter", "herbal", "aperitif"],
  },
  {
    id: 'smoked-negroni',
    name: "Smoked Rosemary Negroni",
    description: "The smoke tames the bitterness of Campari and accentuates the botanicals.",
    image: cocktailImage,
    baseSpirit: "Gin",
    style: "smoky",
    ingredients: ["1oz Gin", "1oz Campari", "1oz Sweet Vermouth"],
    steps: ["Smoke the glass with chips.", "Stir ingredients.", "Strain into glass.", "Garnish with charred rosemary."],
    glassware: "Rocks",
    garnish: "Charred Rosemary",
    isSmoked: true,
    recommendedWood: "Apple",
    smokeTime: 12,
    tags: ["smoky", "bitter", "complex"],
  },
  {
    id: 'margarita',
    name: "Tommy's Margarita",
    description: "A modern classic that highlights the agave flavor.",
    image: cocktailImage,
    baseSpirit: "Tequila",
    style: "classic",
    ingredients: ["2oz Tequila Blanco", "1oz Fresh Lime Juice", "0.5oz Agave Nectar"],
    steps: ["Shake with ice.", "Strain into rocks glass with fresh ice."],
    glassware: "Rocks",
    garnish: "Lime Wheel + Salt Rim",
    isSmoked: false,
    tags: ["sour", "refreshing", "summer"],
  },
  {
    id: 'mezcal-margarita',
    name: "Smoky Mezcal Marg",
    description: "Double the smoke: Mezcal base plus a smoked glass.",
    image: cocktailImage,
    baseSpirit: "Tequila", // Categorized broadly
    style: "smoky",
    ingredients: ["2oz Mezcal", "1oz Lime Juice", "0.5oz Agave", "Jalapeno slice"],
    steps: ["Smoke the glass.", "Muddle jalapeno.", "Shake ingredients.", "Strain into glass."],
    glassware: "Rocks",
    garnish: "Lime + Chili Salt",
    isSmoked: true,
    recommendedWood: "Mesquite",
    smokeTime: 6,
    tags: ["smoky", "spicy", "sour"],
  }
];

// --- Engine ---

// Helper: Parse measurement string to oz
function parseVolume(ingString: string): number {
  const parts = ingString.toLowerCase().split(' ');
  const val = parseFloat(parts[0]);
  if (isNaN(val)) {
    if (ingString.includes('dash')) return 0.03; // approx 1ml
    if (ingString.includes('splash')) return 0.1;
    return 0;
  }
  if (parts[0].includes('oz')) {
      return parseFloat(parts[0].replace('oz', ''));
  }
  return val; // Assume oz if number starts it
}

// Helper: Calculate cost per oz of an item
function getCostPerOz(item: Item): number | null {
  if (!item.price || !item.bottleSize) return null;
  
  let sizeInOz = item.bottleSize;
  if (item.bottleUnit === 'ml') sizeInOz = item.bottleSize / 29.5735;
  if (item.bottleUnit === 'l') sizeInOz = (item.bottleSize * 1000) / 29.5735;
  
  if (sizeInOz <= 0) return null;
  return item.price / sizeInOz;
}

export function generateRecipes(
  inventory: Item[],
  settings: UserSettings,
  preferences: { baseSpirit?: string; style?: string; smoked?: boolean }
): Recipe[] {
  // 1. Filter by preferences
  let candidates = CLASSIC_RECIPES.filter(r => {
    if (preferences.baseSpirit && r.baseSpirit !== preferences.baseSpirit) return false;
    if (preferences.style && r.style !== preferences.style) return false;
    if (preferences.smoked && !r.isSmoked) return false;
    // Don't show smoked drinks if user has no smoker (unless they explicitly asked for smoke style)
    if (r.isSmoked && !settings.hasSmoker && preferences.style !== 'smoky') return false;
    return true;
  });

  // 2. Score by inventory match & Cost
  const scored = candidates.map(recipe => {
    let matches = 0;
    const missing: string[] = [];
    let estimatedCost = 0;
    let missingCost = false;
    
    // Naive matching
    recipe.ingredients.forEach(ing => {
      const ingName = ing.toLowerCase();
      // Find matching item in inventory
      const matchedItem = inventory.find(i => 
        ingName.includes(i.name.toLowerCase()) || 
        ingName.includes(i.category.toLowerCase()) ||
        (i.subtype && ingName.includes(i.subtype.toLowerCase()))
      );
      
      if (matchedItem) {
        matches++;
        
        // Calculate Cost if enabled
        if (settings.enableCostTracking) {
           const costPerOz = getCostPerOz(matchedItem);
           const vol = parseVolume(ing);
           if (costPerOz !== null && vol > 0) {
             estimatedCost += (costPerOz * vol);
           } else if (vol > 0) {
             missingCost = true;
           }
        }
      } else {
        missing.push(ing);
        if (settings.enableCostTracking) missingCost = true;
      }
    });

    // Add wood cost estimate if smoked (approx $0.10 per smoke)
    if (settings.enableCostTracking && recipe.isSmoked) {
      estimatedCost += 0.10;
    }

    return {
      ...recipe,
      matchScore: (matches / recipe.ingredients.length) * 100,
      missingIngredients: missing,
      estimatedCost: estimatedCost > 0 ? parseFloat(estimatedCost.toFixed(2)) : undefined,
      missingCost
    };
  });

  // 3. Sort by match score
  return scored.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

export function getPairingRecommendation(
  input: string, 
  mode: 'meal-to-drink' | 'drink-to-meal',
  hasSmoker: boolean
) {
  // Mock logic - would be AI powered in full app
  const lower = input.toLowerCase();
  
  if (mode === 'meal-to-drink') {
    if (lower.includes('steak') || lower.includes('beef')) {
      return {
        match: hasSmoker ? "Smoked Old Fashioned" : "Cabernet Sauvignon or Manhattan",
        reason: "The rich fat of the steak needs tannins or high proof alcohol to cut through it. The smoke mirrors the char of the grill.",
        wood: "Hickory or Oak"
      };
    }
    if (lower.includes('fish') || lower.includes('sushi')) {
      return {
        match: "Gin & Tonic or Daiquiri",
        reason: "Delicate seafood requires a crisp, high-acid drink that won't overpower the flavors.",
        wood: "Alder (very light)"
      };
    }
    if (lower.includes('taco') || lower.includes('mexican')) {
      return {
        match: "Margarita or Paloma",
        reason: "Citrus and agave are the traditional and chemical soulmates of spicy, savory Mexican cuisine.",
        wood: "Mesquite"
      };
    }
    return {
      match: "Classic Negroni",
      reason: "A versatile aperitif that stimulates the appetite for almost any rich meal.",
      wood: "Cherry"
    };
  } else {
    // Drink to meal
    if (lower.includes('old fashioned') || lower.includes('whiskey')) {
      return {
        match: "Dark Chocolate Truffles or BBQ Ribs",
        reason: "Whiskey's caramel notes bridge the gap to dessert, while its backbone stands up to heavy BBQ sauce.",
        wood: "Pecan"
      };
    }
    return {
      match: "Charcuterie Board",
      reason: "Salty, fatty snacks are the universal pairing for cocktails.",
      wood: "Apple"
    };
  }
}
