import type { Recipe } from "./schema";

export interface DrinkIngredient {
  name: string;
  amount: string;
  unit: string;
  isOptional?: boolean;
  isNASpirit?: boolean;
}

export interface GeneratedDrink {
  id: string;
  name: string;
  description: string;
  baseSpirit: string;
  category: 'alcoholic' | 'mocktail' | 'kid-friendly';
  ingredients: DrinkIngredient[];
  steps: string[];
  glassware: string;
  garnish: string;
  tags: string[];
  isFallback: boolean;
  fallbackReason?: string;
  missingIngredients?: string[];
  substitutions?: { original: string; substitute: string }[];
  matchScore?: number;
  sourceRecipeId?: string;
}

export interface BatchGenerationParams {
  personId?: string;
  occasion?: string;
  inventoryIds?: string[];
  includeKidFriendly: boolean;
  allowCaffeineInKidMocktails: boolean;
  allowSpicyInKidMocktails: boolean;
  preferredTags?: string[];
  excludeTags?: string[];
}

export interface BatchGenerationResult {
  alcoholic: GeneratedDrink[];
  mocktailsNA: GeneratedDrink[];
  kidMocktailsNA?: GeneratedDrink[];
  generatedAt: string;
  params: BatchGenerationParams;
  validationPassed: boolean;
  validationErrors?: string[];
}

export const ALCOHOLIC_CATEGORIES = [
  'spirit',
  'spirits',
  'liqueur',
  'liqueurs',
  'wine',
  'beer',
  'fortified-wine',
  'vermouth',
  'amaro',
  'bitters',
  'tincture',
  'aperitif',
  'digestif',
  'brandy',
  'whiskey',
  'bourbon',
  'rye',
  'scotch',
  'vodka',
  'gin',
  'rum',
  'tequila',
  'mezcal',
  'cognac',
  'armagnac',
  'calvados',
  'pisco',
  'grappa',
  'absinthe',
  'aquavit',
  'sake',
  'soju',
  'baijiu',
];

export const ALCOHOLIC_KEYWORDS = [
  'vodka',
  'gin',
  'rum',
  'tequila',
  'whiskey',
  'whisky',
  'bourbon',
  'rye',
  'scotch',
  'brandy',
  'cognac',
  'mezcal',
  'liqueur',
  'triple sec',
  'cointreau',
  'grand marnier',
  'amaretto',
  'kahlua',
  'baileys',
  'campari',
  'aperol',
  'vermouth',
  'port',
  'sherry',
  'madeira',
  'marsala',
  'champagne',
  'prosecco',
  'wine',
  'beer',
  'ale',
  'lager',
  'stout',
  'cider',
  'bitters',
  'angostura',
  'peychauds',
  'absinthe',
  'chartreuse',
  'benedictine',
  'drambuie',
  'frangelico',
  'sambuca',
  'ouzo',
  'grappa',
  'pisco',
  'cachaça',
  'soju',
  'sake',
  'amaro',
  'fernet',
  'cynar',
  'averna',
  'montenegro',
  'st germain',
  'elderflower liqueur',
  'maraschino liqueur',
  'creme de',
  'crème de',
  'curacao',
  'pimms',
  'sloe gin',
  'navy strength',
  'overproof',
  'proof',
  'abv',
  '% alcohol',
];

export const CAFFEINE_INGREDIENTS = [
  'coffee',
  'espresso',
  'cold brew',
  'black tea',
  'matcha',
  'green tea',
  'energy drink',
  'red bull',
  'monster',
  'cola',
  'coke',
  'pepsi',
  'dr pepper',
  'mountain dew',
];

export const SPICY_INGREDIENTS = [
  'jalapeño',
  'jalapeno',
  'habanero',
  'serrano',
  'cayenne',
  'hot sauce',
  'tabasco',
  'sriracha',
  'chili',
  'chile',
  'pepper flakes',
  'spicy',
  'heat',
  'ghost pepper',
  'scotch bonnet',
];

export const TARGET_COUNTS = {
  alcoholic: { min: 5, max: 6 },
  mocktailsNA: { min: 3, max: 4 },
  kidMocktailsNA: { min: 2, max: 3 },
};
