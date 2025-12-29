// --- Smart Pairing Engine ---

import { Wood, Recipe } from "../store";
import { scoreWoodForContext } from "./learning";

interface PairingResult {
  match: string;
  reason: string;
  woodRecommendation?: {
    wood: string;
    reason: string;
  };
}

export function generatePairing(
  input: string, 
  mode: 'meal-to-drink' | 'drink-to-meal',
  context: {
    hasSmoker: boolean;
    availableWoods: Wood[];
  }
): PairingResult {
  const lowerInput = input.toLowerCase();
  
  // MEAL -> DRINK
  if (mode === 'meal-to-drink') {
    let result: PairingResult = {
      match: "Classic Negroni",
      reason: "A versatile aperitif that cuts through richness and stimulates the appetite."
    };

    // Rule-based heuristics
    if (lowerInput.includes('steak') || lowerInput.includes('beef') || lowerInput.includes('burger')) {
      result = {
        match: "Smoked Old Fashioned or Cabernet Sauvignon",
        reason: "The rich fat and umami of beef require tannins or high-proof spirit to cleanse the palate. Smoke mirrors the char."
      };
      if (context.hasSmoker) {
        // Find best wood
        const woods = context.availableWoods.map(w => ({ 
          wood: w, 
          ...scoreWoodForContext(w, { mealTags: ['beef', 'steak'], drinkTags: ['whiskey'] }) 
        })).sort((a, b) => b.score - a.score);
        
        if (woods.length > 0) {
          result.woodRecommendation = {
            wood: woods[0].wood.name,
            reason: woods[0].reason
          };
        }
      }
    }
    else if (lowerInput.includes('taco') || lowerInput.includes('mexican') || lowerInput.includes('spicy')) {
      result = {
        match: "Margarita or Paloma",
        reason: "Citrus and agave soothe the heat of spice, while the salt rim bridges the savory flavors."
      };
       if (context.hasSmoker) {
         result.woodRecommendation = { wood: "Mesquite", reason: "Traditional pairing for Mexican flavors" };
       }
    }
    else if (lowerInput.includes('sushi') || lowerInput.includes('fish')) {
      result = {
        match: "Gin & Tonic or Martini",
        reason: "Delicate seafood is easily overpowered. Gin botanicals complement without crushing the flavor."
      };
      if (context.hasSmoker) {
         result.woodRecommendation = { wood: "Alder", reason: "Very light wood used for smoking salmon" };
       }
    }
    else if (lowerInput.includes('dessert') || lowerInput.includes('cake') || lowerInput.includes('chocolate')) {
      result = {
        match: "Espresso Martini or Port",
        reason: "Pair sweetness with sweetness, or use bitterness (coffee) to contrast the sugar."
      };
       if (context.hasSmoker) {
         result.woodRecommendation = { wood: "Cherry or Maple", reason: "Enhances sweet dessert notes" };
       }
    }

    return result;
  } 
  
  // DRINK -> MEAL
  else {
    if (lowerInput.includes('old fashioned') || lowerInput.includes('whiskey')) {
      return {
        match: "BBQ Ribs or Dark Chocolate",
        reason: "Whiskey's caramel notes bridge to dessert, while its alcohol backbone stands up to heavy BBQ sauce."
      };
    }
    if (lowerInput.includes('margarita') || lowerInput.includes('tequila')) {
      return {
        match: "Fish Tacos or Ceviche",
        reason: "Acid + Acid = Balance. The lime in the drink matches the lime in the food."
      };
    }
    if (lowerInput.includes('wine') && (lowerInput.includes('red') || lowerInput.includes('cabernet'))) {
       return {
        match: "Steak Frites or Aged Cheddar",
        reason: "Tannins bind to proteins and fats, making the meat feel more tender and the wine smoother."
      };
    }
    
    return {
      match: "Charcuterie Board",
      reason: "Salty, fatty snacks are the universal pairing key for almost any cocktail."
    };
  }
}
