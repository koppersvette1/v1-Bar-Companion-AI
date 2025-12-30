import type { Recipe } from "@shared/schema";
import {
  GeneratedDrink,
  BatchGenerationParams,
  BatchGenerationResult,
  DrinkIngredient,
  ALCOHOLIC_CATEGORIES,
  ALCOHOLIC_KEYWORDS,
  CAFFEINE_INGREDIENTS,
  SPICY_INGREDIENTS,
  TARGET_COUNTS,
} from "@shared/generation-types";

export function isAlcoholicIngredient(
  ingredientName: string,
  category?: string,
  tags?: string[]
): boolean {
  const nameLower = ingredientName.toLowerCase();
  
  if (tags?.includes('na') || tags?.includes('non-alcoholic') || tags?.includes('zero-proof')) {
    return false;
  }
  
  if (category) {
    const catLower = category.toLowerCase();
    if (ALCOHOLIC_CATEGORIES.some(cat => catLower.includes(cat))) {
      return true;
    }
  }
  
  for (const keyword of ALCOHOLIC_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      if (nameLower.includes('non-alcoholic') || nameLower.includes('na ') || 
          nameLower.includes('zero proof') || nameLower.includes('mocktail')) {
        continue;
      }
      return true;
    }
  }
  
  return false;
}

export function hasCaffeineIngredient(ingredientName: string): boolean {
  const nameLower = ingredientName.toLowerCase();
  return CAFFEINE_INGREDIENTS.some(caf => nameLower.includes(caf));
}

export function hasSpicyIngredient(ingredientName: string): boolean {
  const nameLower = ingredientName.toLowerCase();
  return SPICY_INGREDIENTS.some(spicy => nameLower.includes(spicy));
}

export function validateNonAlcoholic(drink: GeneratedDrink): { valid: boolean; reason?: string } {
  for (const ingredient of drink.ingredients) {
    if (ingredient.isNASpirit) continue;
    
    if (isAlcoholicIngredient(ingredient.name)) {
      return { valid: false, reason: `Contains alcoholic ingredient: ${ingredient.name}` };
    }
  }
  return { valid: true };
}

export function validateKidFriendly(
  drink: GeneratedDrink,
  allowCaffeine: boolean,
  allowSpicy: boolean
): { valid: boolean; reason?: string } {
  const naCheck = validateNonAlcoholic(drink);
  if (!naCheck.valid) return naCheck;

  if (!allowCaffeine) {
    for (const ingredient of drink.ingredients) {
      if (hasCaffeineIngredient(ingredient.name)) {
        return { valid: false, reason: `Contains caffeine: ${ingredient.name}` };
      }
    }
  }

  if (!allowSpicy) {
    for (const ingredient of drink.ingredients) {
      if (hasSpicyIngredient(ingredient.name)) {
        return { valid: false, reason: `Contains spicy ingredient: ${ingredient.name}` };
      }
    }
  }

  return { valid: true };
}

const FALLBACK_MOCKTAILS: Omit<GeneratedDrink, 'id'>[] = [
  {
    name: "Sparkling Citrus Refresher",
    description: "A bright and bubbly citrus mocktail",
    baseSpirit: "none",
    category: "mocktail",
    ingredients: [
      { name: "Fresh Orange Juice", amount: "3", unit: "oz" },
      { name: "Fresh Lemon Juice", amount: "1", unit: "oz" },
      { name: "Simple Syrup", amount: "0.5", unit: "oz" },
      { name: "Club Soda", amount: "3", unit: "oz" },
    ],
    steps: ["Add juices and syrup to glass with ice", "Top with club soda", "Stir gently"],
    glassware: "highball",
    garnish: "Orange wheel",
    tags: ["refreshing", "citrus", "na"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
  {
    name: "Berry Mint Spritz",
    description: "Fresh berries with cooling mint",
    baseSpirit: "none",
    category: "mocktail",
    ingredients: [
      { name: "Mixed Berries", amount: "6", unit: "berries" },
      { name: "Fresh Mint Leaves", amount: "6", unit: "leaves" },
      { name: "Lime Juice", amount: "1", unit: "oz" },
      { name: "Simple Syrup", amount: "0.75", unit: "oz" },
      { name: "Sparkling Water", amount: "4", unit: "oz" },
    ],
    steps: ["Muddle berries and mint", "Add lime and syrup", "Add ice and top with sparkling water"],
    glassware: "highball",
    garnish: "Mint sprig and berries",
    tags: ["fruity", "refreshing", "na"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
  {
    name: "Tropical Sunset",
    description: "A tropical paradise in a glass",
    baseSpirit: "none",
    category: "mocktail",
    ingredients: [
      { name: "Pineapple Juice", amount: "3", unit: "oz" },
      { name: "Mango Nectar", amount: "2", unit: "oz" },
      { name: "Coconut Cream", amount: "1", unit: "oz" },
      { name: "Grenadine", amount: "0.5", unit: "oz" },
    ],
    steps: ["Blend pineapple, mango, and coconut with ice", "Pour into glass", "Drizzle grenadine for sunset effect"],
    glassware: "hurricane",
    garnish: "Pineapple wedge",
    tags: ["tropical", "sweet", "na"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
  {
    name: "Cucumber Lime Cooler",
    description: "Cool and refreshing spa-style drink",
    baseSpirit: "none",
    category: "mocktail",
    ingredients: [
      { name: "Cucumber Slices", amount: "4", unit: "slices" },
      { name: "Fresh Lime Juice", amount: "1", unit: "oz" },
      { name: "Agave Nectar", amount: "0.5", unit: "oz" },
      { name: "Tonic Water", amount: "4", unit: "oz" },
    ],
    steps: ["Muddle cucumber gently", "Add lime and agave", "Fill with ice and tonic"],
    glassware: "highball",
    garnish: "Cucumber ribbon",
    tags: ["refreshing", "light", "na"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
];

const FALLBACK_KID_MOCKTAILS: Omit<GeneratedDrink, 'id'>[] = [
  {
    name: "Rainbow Fizz",
    description: "A colorful and fun fizzy drink for kids",
    baseSpirit: "none",
    category: "kid-friendly",
    ingredients: [
      { name: "Lemonade", amount: "4", unit: "oz" },
      { name: "Sparkling Water", amount: "2", unit: "oz" },
      { name: "Grenadine", amount: "0.5", unit: "oz" },
      { name: "Blue Curaçao Syrup (NA)", amount: "0.25", unit: "oz" },
    ],
    steps: ["Pour lemonade over ice", "Add sparkling water", "Layer grenadine and blue syrup for rainbow effect"],
    glassware: "highball",
    garnish: "Colorful straw and cherry",
    tags: ["fun", "colorful", "kid-friendly", "na"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
  {
    name: "Strawberry Lemonade Slush",
    description: "Sweet frozen strawberry treat",
    baseSpirit: "none",
    category: "kid-friendly",
    ingredients: [
      { name: "Fresh Strawberries", amount: "1", unit: "cup" },
      { name: "Lemonade", amount: "4", unit: "oz" },
      { name: "Ice", amount: "1", unit: "cup" },
      { name: "Honey", amount: "1", unit: "tsp" },
    ],
    steps: ["Blend all ingredients until slushy", "Pour into fun glass", "Add whipped cream on top"],
    glassware: "hurricane",
    garnish: "Strawberry and whipped cream",
    tags: ["sweet", "frozen", "kid-friendly", "na"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
  {
    name: "Apple Cider Sparkler",
    description: "Bubbly apple goodness",
    baseSpirit: "none",
    category: "kid-friendly",
    ingredients: [
      { name: "Apple Juice", amount: "4", unit: "oz" },
      { name: "Sparkling Water", amount: "2", unit: "oz" },
      { name: "Cinnamon Stick", amount: "1", unit: "" },
    ],
    steps: ["Pour apple juice over ice", "Add sparkling water", "Stir with cinnamon stick"],
    glassware: "rocks",
    garnish: "Apple slice and cinnamon stick",
    tags: ["fruity", "kid-friendly", "na"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
];

const FALLBACK_ALCOHOLIC: Omit<GeneratedDrink, 'id'>[] = [
  {
    name: "Classic Highball",
    description: "Simple spirit and mixer",
    baseSpirit: "whiskey",
    category: "alcoholic",
    ingredients: [
      { name: "Whiskey", amount: "2", unit: "oz" },
      { name: "Ginger Ale", amount: "4", unit: "oz" },
    ],
    steps: ["Fill glass with ice", "Add whiskey", "Top with ginger ale", "Stir gently"],
    glassware: "highball",
    garnish: "Lemon twist",
    tags: ["classic", "simple", "whiskey"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
  {
    name: "Vodka Soda",
    description: "Clean and refreshing",
    baseSpirit: "vodka",
    category: "alcoholic",
    ingredients: [
      { name: "Vodka", amount: "2", unit: "oz" },
      { name: "Club Soda", amount: "4", unit: "oz" },
      { name: "Lime Juice", amount: "0.5", unit: "oz" },
    ],
    steps: ["Add vodka and lime to glass with ice", "Top with club soda"],
    glassware: "highball",
    garnish: "Lime wedge",
    tags: ["light", "refreshing", "vodka"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
  {
    name: "Rum Punch",
    description: "Tropical party favorite",
    baseSpirit: "rum",
    category: "alcoholic",
    ingredients: [
      { name: "White Rum", amount: "2", unit: "oz" },
      { name: "Pineapple Juice", amount: "2", unit: "oz" },
      { name: "Orange Juice", amount: "1", unit: "oz" },
      { name: "Grenadine", amount: "0.5", unit: "oz" },
    ],
    steps: ["Shake all ingredients with ice", "Strain into glass with fresh ice"],
    glassware: "hurricane",
    garnish: "Orange wheel and cherry",
    tags: ["tropical", "fruity", "rum"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
  {
    name: "Gin Tonic",
    description: "Timeless classic",
    baseSpirit: "gin",
    category: "alcoholic",
    ingredients: [
      { name: "Gin", amount: "2", unit: "oz" },
      { name: "Tonic Water", amount: "4", unit: "oz" },
    ],
    steps: ["Fill glass with ice", "Add gin", "Top with tonic", "Stir once"],
    glassware: "highball",
    garnish: "Lime wedge",
    tags: ["classic", "refreshing", "gin"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
  {
    name: "Tequila Sunrise",
    description: "Beautiful layered cocktail",
    baseSpirit: "tequila",
    category: "alcoholic",
    ingredients: [
      { name: "Tequila", amount: "2", unit: "oz" },
      { name: "Orange Juice", amount: "4", unit: "oz" },
      { name: "Grenadine", amount: "0.5", unit: "oz" },
    ],
    steps: ["Add tequila and OJ to glass with ice", "Slowly pour grenadine", "Let it sink for sunrise effect"],
    glassware: "highball",
    garnish: "Orange slice and cherry",
    tags: ["classic", "fruity", "tequila"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
  {
    name: "Bourbon Smash",
    description: "Herbaceous bourbon cocktail",
    baseSpirit: "bourbon",
    category: "alcoholic",
    ingredients: [
      { name: "Bourbon", amount: "2", unit: "oz" },
      { name: "Fresh Lemon Juice", amount: "1", unit: "oz" },
      { name: "Simple Syrup", amount: "0.75", unit: "oz" },
      { name: "Mint Leaves", amount: "6", unit: "leaves" },
    ],
    steps: ["Muddle mint with syrup", "Add bourbon and lemon", "Shake with ice", "Strain over fresh ice"],
    glassware: "rocks",
    garnish: "Mint sprig",
    tags: ["herbaceous", "bourbon", "refreshing"],
    isFallback: true,
    fallbackReason: "Fallback template to meet count requirements",
  },
];

function generateId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function recipeToGeneratedDrink(recipe: Recipe, isFallback = false): GeneratedDrink {
  const ingredients: DrinkIngredient[] = Array.isArray(recipe.ingredients)
    ? (recipe.ingredients as any[]).map(ing => ({
        name: ing.name || '',
        amount: ing.amount || '',
        unit: ing.unit || '',
        isOptional: ing.isOptional || false,
      }))
    : [];

  return {
    id: generateId(),
    name: recipe.name,
    description: recipe.description,
    baseSpirit: recipe.baseSpirit,
    category: recipe.category as 'alcoholic' | 'mocktail' | 'kid-friendly',
    ingredients,
    steps: recipe.steps,
    glassware: recipe.glassware,
    garnish: recipe.garnish,
    tags: recipe.tags,
    isFallback,
    sourceRecipeId: recipe.id,
  };
}

export function generateBatch(
  recipes: Recipe[],
  params: BatchGenerationParams
): BatchGenerationResult {
  const validationErrors: string[] = [];
  
  const alcoholicRecipes = recipes.filter(r => r.category === 'alcoholic');
  const mocktailRecipes = recipes.filter(r => r.category === 'mocktail');
  const kidRecipes = recipes.filter(r => r.category === 'kid-friendly');

  const shuffled = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const alcoholic: GeneratedDrink[] = [];
  for (const recipe of shuffled(alcoholicRecipes).slice(0, TARGET_COUNTS.alcoholic.max)) {
    alcoholic.push(recipeToGeneratedDrink(recipe));
  }
  
  while (alcoholic.length < TARGET_COUNTS.alcoholic.min) {
    const fallbackIndex = alcoholic.length % FALLBACK_ALCOHOLIC.length;
    const fallback = FALLBACK_ALCOHOLIC[fallbackIndex];
    alcoholic.push({ ...fallback, id: generateId() });
  }

  const mocktailsNA: GeneratedDrink[] = [];
  for (const recipe of shuffled(mocktailRecipes).slice(0, TARGET_COUNTS.mocktailsNA.max)) {
    const drink = recipeToGeneratedDrink(recipe);
    const validation = validateNonAlcoholic(drink);
    if (validation.valid) {
      mocktailsNA.push(drink);
    } else {
      validationErrors.push(`Rejected mocktail "${recipe.name}": ${validation.reason}`);
    }
  }
  
  while (mocktailsNA.length < TARGET_COUNTS.mocktailsNA.min) {
    const fallbackIndex = mocktailsNA.length % FALLBACK_MOCKTAILS.length;
    const fallback = FALLBACK_MOCKTAILS[fallbackIndex];
    mocktailsNA.push({ ...fallback, id: generateId() });
  }

  let kidMocktailsNA: GeneratedDrink[] | undefined;
  
  if (params.includeKidFriendly) {
    kidMocktailsNA = [];
    
    for (const recipe of shuffled(kidRecipes).slice(0, TARGET_COUNTS.kidMocktailsNA.max)) {
      const drink = recipeToGeneratedDrink(recipe);
      const validation = validateKidFriendly(
        drink,
        params.allowCaffeineInKidMocktails,
        params.allowSpicyInKidMocktails
      );
      if (validation.valid) {
        kidMocktailsNA.push(drink);
      } else {
        validationErrors.push(`Rejected kid mocktail "${recipe.name}": ${validation.reason}`);
      }
    }
    
    while (kidMocktailsNA.length < TARGET_COUNTS.kidMocktailsNA.min) {
      const fallbackIndex = kidMocktailsNA.length % FALLBACK_KID_MOCKTAILS.length;
      const fallback = FALLBACK_KID_MOCKTAILS[fallbackIndex];
      kidMocktailsNA.push({ ...fallback, id: generateId() });
    }
  }

  const alcoholicValid = alcoholic.length >= TARGET_COUNTS.alcoholic.min && 
                         alcoholic.length <= TARGET_COUNTS.alcoholic.max;
  const mocktailsValid = mocktailsNA.length >= TARGET_COUNTS.mocktailsNA.min && 
                         mocktailsNA.length <= TARGET_COUNTS.mocktailsNA.max;
  const kidValid = !params.includeKidFriendly || Boolean(
    kidMocktailsNA && 
    kidMocktailsNA.length >= TARGET_COUNTS.kidMocktailsNA.min && 
    kidMocktailsNA.length <= TARGET_COUNTS.kidMocktailsNA.max
  );

  for (const drink of mocktailsNA) {
    const check = validateNonAlcoholic(drink);
    if (!check.valid) {
      validationErrors.push(`Final validation failed for "${drink.name}": ${check.reason}`);
    }
  }

  if (kidMocktailsNA) {
    for (const drink of kidMocktailsNA) {
      const check = validateKidFriendly(
        drink,
        params.allowCaffeineInKidMocktails,
        params.allowSpicyInKidMocktails
      );
      if (!check.valid) {
        validationErrors.push(`Final validation failed for kid drink "${drink.name}": ${check.reason}`);
      }
    }
  }

  const validationPassed = alcoholicValid && mocktailsValid && kidValid && validationErrors.length === 0;

  return {
    alcoholic: alcoholic.slice(0, TARGET_COUNTS.alcoholic.max),
    mocktailsNA: mocktailsNA.slice(0, TARGET_COUNTS.mocktailsNA.max),
    kidMocktailsNA: kidMocktailsNA?.slice(0, TARGET_COUNTS.kidMocktailsNA.max),
    generatedAt: new Date().toISOString(),
    params,
    validationPassed,
    validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
  };
}
