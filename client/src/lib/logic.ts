import { Item } from "@/lib/store";
import cocktailImage from '@assets/generated_images/classic_old_fashioned_cocktail.png';

// Fallback logic when no API key is present
export const fallbackRecipes = [
  {
    name: "Classic Old Fashioned",
    description: "The definition of a cocktail: spirits, sugar, water, and bitters.",
    image: cocktailImage,
    required: ["Whiskey", "Bitters", "Sugar/Syrup"],
    ingredients: [
      "2oz Whiskey (Bourbon or Rye)",
      "0.25oz Simple Syrup",
      "2 dashes Angostura Bitters",
      "Orange Peel"
    ],
    steps: [
      "Add syrup and bitters to a mixing glass.",
      "Add whiskey and ice.",
      "Stir until well chilled (30-45 seconds).",
      "Strain into a rocks glass over a large ice cube.",
      "Express orange peel oil over the drink and drop it in."
    ],
    tools: ["Mixing Glass", "Bar Spoon", "Strainer"],
    tips: "Don't rush the stir. Dilution is key."
  },
  {
    name: "Manhattan",
    description: "A timeless classic that balances rich whiskey with sweet vermouth.",
    image: cocktailImage,
    required: ["Whiskey", "Sweet Vermouth", "Bitters"],
    ingredients: [
      "2oz Whiskey (Rye is traditional)",
      "1oz Sweet Vermouth",
      "2 dashes Angostura Bitters",
      "Maraschino Cherry"
    ],
    steps: [
      "Combine whiskey, vermouth, and bitters in a mixing glass with ice.",
      "Stir until well chilled.",
      "Strain into a chilled coupe or cocktail glass.",
      "Garnish with a cherry."
    ],
    tools: ["Mixing Glass", "Bar Spoon", "Strainer"],
    tips: "Store your vermouth in the fridge to keep it fresh."
  },
  {
    name: "Smoked Old Fashioned",
    description: "A rich twist on the classic using smoke to add depth.",
    image: cocktailImage,
    required: ["Whiskey", "Bitters", "Syrup", "Smoker"],
    ingredients: [
      "2oz Bourbon",
      "0.25oz Maple Syrup",
      "2 dashes Angostura Bitters",
      "Orange Peel",
      "Oak Wood Chips"
    ],
    steps: [
      "Prepare your cocktail smoker with oak chips.",
      "Build the drink in a mixing glass (whiskey, syrup, bitters) and stir with ice.",
      "Strain into a rocks glass with a large cube.",
      "Place the smoker on top and ignite.",
      "Let the smoke sit for 10-15 seconds before serving."
    ],
    tools: ["Mixing Glass", "Strainer", "Cocktail Smoker", "Torch"],
    tips: "Oak complements bourbon perfectly. Try cherry wood for a sweeter profile."
  },
  {
    name: "Negroni",
    description: "The perfect balance of bitter, sweet, and botanical.",
    image: cocktailImage,
    required: ["Gin", "Campari", "Sweet Vermouth"],
    ingredients: [
      "1oz Gin",
      "1oz Campari",
      "1oz Sweet Vermouth",
      "Orange Peel"
    ],
    steps: [
      "Add all ingredients to a mixing glass with ice.",
      "Stir until well chilled.",
      "Strain into a rocks glass over fresh ice.",
      "Garnish with an orange peel."
    ],
    tools: ["Mixing Glass", "Bar Spoon", "Strainer"],
    tips: "Equal parts makes it easy to remember."
  }
];

export const findMatch = (inventory: Item[], preferences: any) => {
  // Simple keyword matching for fallback mode
  const invNames = inventory.map(i => i.name.toLowerCase());
  
  // Try to find a recipe where we have at least one base ingredient
  const available = fallbackRecipes.filter(r => {
    // Check if user has main spirit
    const needsWhiskey = r.required.includes("Whiskey");
    const hasWhiskey = invNames.some(n => n.includes("whiskey") || n.includes("bourbon") || n.includes("rye"));
    
    const needsGin = r.required.includes("Gin");
    const hasGin = invNames.some(n => n.includes("gin"));

    if (needsWhiskey && !hasWhiskey) return false;
    if (needsGin && !hasGin) return false;

    // Check smoker preference
    if (preferences.smoked && !r.required.includes("Smoker")) return false;
    if (!preferences.smoked && r.required.includes("Smoker")) return false;

    return true;
  });

  // Return a random match or default to Old Fashioned
  return available.length > 0 
    ? available[Math.floor(Math.random() * available.length)] 
    : fallbackRecipes[0];
};

export const fallbackPairings = [
  {
    keywords: ["spicy", "taco", "mexican", "curry"],
    match: "Margarita or Paloma",
    desc: "Acidity and sweetness cut through heat beautifully."
  },
  {
    keywords: ["steak", "beef", "burger", "meat"],
    match: "Old Fashioned or Cabernet",
    desc: "Bold flavors need bold drinks. The tannins or whiskey depth stand up to the fat."
  },
  {
    keywords: ["fish", "sushi", "seafood", "light"],
    match: "Gin & Tonic or Martini",
    desc: "Crisp, botanical flavors won't overpower delicate seafood."
  },
  {
    keywords: ["dessert", "chocolate", "sweet"],
    match: "Espresso Martini or Port",
    desc: "Match sweetness with sweetness, or use coffee to contrast."
  }
];

export const getPairing = (input: string, mode: 'food-to-drink' | 'drink-to-food') => {
  const lowerInput = input.toLowerCase();
  
  if (mode === 'food-to-drink') {
    const match = fallbackPairings.find(p => p.keywords.some(k => lowerInput.includes(k)));
    if (match) {
      return {
        match: match.match,
        description: match.desc,
        image: cocktailImage
      };
    }
    return {
      match: "Classic Highball",
      description: "When in doubt, a crisp highball (whiskey ginger or gin tonic) pairs with almost anything.",
      image: cocktailImage
    };
  } else {
    // Drink to food logic (simplified)
    if (lowerInput.includes("whiskey") || lowerInput.includes("old fashioned")) {
      return { match: "Dry Aged Steak or Dark Chocolate", description: "Rich flavors complement the spirit's depth.", image: cocktailImage };
    }
    if (lowerInput.includes("gin") || lowerInput.includes("tonic")) {
       return { match: "Oysters or Goat Cheese Salad", description: "Bright botanicals love fresh, tangy foods.", image: cocktailImage };
    }
    return {
      match: "Bar Nuts & Olives",
      description: "A classic salty snack is always a safe bet.",
      image: cocktailImage
    };
  }
};
