import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Sparkles, Loader2, RefreshCw, ChefHat, Wind, Info, Filter, X, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateRecipes, Recipe } from "@/lib/logic";
import { Link } from "wouter";
import HeroHeader from "@/components/themed/hero-header";
import SectionPanel from "@/components/themed/section-panel";
import SmokeBackdrop from "@/components/themed/smoke-backdrop";

export default function Make() {
  const [step, setStep] = useState<'preferences' | 'generating' | 'result'>('preferences');
  const [preferences, setPreferences] = useState<{
    baseSpirit?: string;
    style?: string;
    smoked?: boolean;
  }>({
    style: 'classic',
    smoked: false,
  });
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const { inventory, userSettings } = useStore();

  const handleGenerate = async () => {
    setStep('generating');
    
    // Simulate thinking time
    await new Promise(r => setTimeout(r, 1500));
    
    const results = generateRecipes(inventory, userSettings, preferences);
    setRecipes(results);
    if(results.length > 0) setSelectedRecipe(results[0]);
    setStep('result');
  };

  if (step === 'generating') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-[hsl(var(--primary))]/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-12 h-12 text-[hsl(var(--primary))] animate-spin relative z-10" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-[hsl(var(--foreground))] mb-2">Analyzing Inventory...</h2>
          <p className="text-[hsl(var(--muted-foreground))]">Checking pairing rules and smoke profiles.</p>
        </div>
      </div>
    );
  }

  if (step === 'result' && selectedRecipe) {
    return (
      <SmokeBackdrop variant="subtle">
        <SectionPanel spacing="compact">
          {/* Navigation / Header */}
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('preferences')} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center gap-1">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
              {selectedRecipe.matchScore === 100 ? "Perfect Match" : "Missing Ingredients"}
            </span>
          </div>

          {/* Hero Section with Image */}
          <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden group shadow-2xl border border-[hsl(var(--border))]">
            <img src={selectedRecipe.image} alt={selectedRecipe.name} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-[hsl(var(--foreground))]/10 backdrop-blur-md rounded text-[10px] font-bold uppercase text-[hsl(var(--foreground))]">
                  {selectedRecipe.baseSpirit}
                </span>
                {selectedRecipe.isSmoked && (
                  <span className="px-2 py-1 bg-[hsl(var(--primary))]/80 backdrop-blur-md rounded text-[10px] font-bold uppercase text-[hsl(var(--foreground))] flex items-center gap-1">
                    <Wind className="w-3 h-3" /> Smoked
                  </span>
                )}
                {userSettings.enableCostTracking && selectedRecipe.estimatedCost && (
                  <span className={cn(
                    "px-2 py-1 backdrop-blur-md rounded text-[10px] font-bold uppercase text-[hsl(var(--foreground))] flex items-center gap-1",
                    selectedRecipe.missingCost ? "bg-yellow-500/80" : "bg-green-500/80"
                  )}>
                    <DollarSign className="w-3 h-3" />
                    {selectedRecipe.missingCost ? `~ $${selectedRecipe.estimatedCost}` : `$${selectedRecipe.estimatedCost}`}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[hsl(var(--foreground))] mb-2">{selectedRecipe.name}</h1>
              <p className="text-[hsl(var(--foreground))]/80 max-w-lg leading-relaxed">{selectedRecipe.description}</p>
            </div>
          </div>

          {/* Recipe Content */}
          <div className="grid md:grid-cols-3 gap-8">

            {/* Sidebar Info */}
            <div className="md:col-span-1 space-y-6">
              {/* Ingredients Card */}
              <div className="bg-[hsl(var(--card))] p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4">
                <h3 className="text-lg font-serif font-bold text-[hsl(var(--primary))] border-b border-[hsl(var(--primary))]/20 pb-2">Ingredients</h3>
                <ul className="space-y-3">
                  {selectedRecipe.ingredients.map((ing, i) => {
                    const isMissing = selectedRecipe.missingIngredients?.includes(ing);
                    return (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className={cn("w-1.5 h-1.5 rounded-full", isMissing ? "bg-red-500" : "bg-[hsl(var(--primary))]")} />
                        <span className={isMissing ? "text-[hsl(var(--foreground))]/50 line-through" : "text-[hsl(var(--foreground))]/90"}>
                          {ing}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {selectedRecipe.missingIngredients && selectedRecipe.missingIngredients.length > 0 && (
                  <p className="text-xs text-red-400 mt-2">You are missing some ingredients.</p>
                )}
              </div>

              {/* Cost Breakdown Card */}
              {userSettings.enableCostTracking && selectedRecipe.estimatedCost && (
                <div className="bg-[hsl(var(--card))] p-6 rounded-2xl border border-[hsl(var(--border))] border-l-4 border-l-green-500 bg-green-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <DollarSign className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Cost Breakdown</h3>
                  </div>
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    Estimated cost per drink:
                    <span className="block text-2xl text-[hsl(var(--foreground))] font-bold my-1">${selectedRecipe.estimatedCost}</span>
                    {selectedRecipe.missingCost && (
                      <span className="text-xs text-yellow-400 block mt-1">*Partial estimate (some item prices missing)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Smoker Setup Card */}
              {selectedRecipe.isSmoked && (
                <div className="bg-[hsl(var(--card))] p-6 rounded-2xl border border-[hsl(var(--border))] border-l-4 border-l-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 space-y-3">
                  <div className="flex items-center gap-2 text-[hsl(var(--primary))]">
                    <Wind className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Smoker Setup</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">Wood:</span>
                      <span className="text-[hsl(var(--foreground))] font-medium">{selectedRecipe.recommendedWood || "Any"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">Time:</span>
                      <span className="text-[hsl(var(--foreground))] font-medium">{selectedRecipe.smokeTime || "10"} seconds</span>
                    </div>
                  </div>
                  <Link href="/smoker">
                    <a className="block w-full py-2 mt-2 bg-[hsl(var(--primary))]/10 hover:bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-xs font-bold text-center rounded transition-colors">
                      Launch Guided Smoker
                    </a>
                  </Link>
                </div>
              )}
            </div>

            {/* Preparation Card */}
            <div className="md:col-span-2 bg-[hsl(var(--card))] p-8 rounded-2xl border border-[hsl(var(--border))]">
              <h3 className="text-2xl font-serif font-bold text-[hsl(var(--foreground))] mb-6">Preparation</h3>
              <div className="space-y-8">
                {selectedRecipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] flex items-center justify-center font-bold font-serif group-hover:bg-[hsl(var(--primary))] group-hover:text-[hsl(var(--background))] transition-colors">
                      {i + 1}
                    </div>
                    <p className="text-[hsl(var(--foreground))]/80 leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 py-4 bg-[hsl(var(--primary))] text-white font-bold rounded-xl hover:bg-[hsl(var(--primary))]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[hsl(var(--primary))]/20">
                <ChefHat className="w-5 h-5" /> I Made This
              </button>
            </div>
          </div>
        </SectionPanel>
      </SmokeBackdrop>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-bold text-white">Bartender's Choice</h1>
        <p className="text-muted-foreground">AI-powered recommendations based on your unique inventory.</p>
      </div>

      <div className="space-y-8">
        {/* Base Spirit */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Base Spirit</label>
          <div className="grid grid-cols-3 gap-3">
            {['Any', 'Whiskey', 'Gin', 'Vodka', 'Rum', 'Tequila'].map((opt) => (
              <button
                key={opt}
                onClick={() => setPreferences({ ...preferences, baseSpirit: opt === 'Any' ? undefined : opt })}
                className={cn(
                  "p-3 rounded-xl border transition-all text-sm font-medium",
                  (preferences.baseSpirit === opt || (!preferences.baseSpirit && opt === 'Any'))
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card/50 border-white/10 text-muted-foreground hover:bg-white/5 hover:border-white/20"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Style</label>
          <div className="grid grid-cols-2 gap-3">
             {[
               { id: 'classic', label: 'Classic', desc: 'Timeless standards' },
               { id: 'modern', label: 'Modern', desc: 'New wave & complex' },
               { id: 'tiki', label: 'Tiki', desc: 'Tropical & layered' },
               { id: 'low-abv', label: 'Low-ABV', desc: 'Sessionable' },
             ].map((opt) => (
               <button
                key={opt.id}
                onClick={() => setPreferences({ ...preferences, style: opt.id })}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left group",
                  preferences.style === opt.id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card/50 border-white/10 text-muted-foreground hover:bg-white/5 hover:border-white/20"
                )}
              >
                <div className="font-bold mb-1 group-hover:text-white transition-colors">{opt.label}</div>
                <div className="text-xs opacity-70 font-normal">{opt.desc}</div>
              </button>
             ))}
          </div>
        </div>

        {/* Smoker Toggle */}
        <div className={cn(
           "glass-card p-4 rounded-xl flex items-center justify-between border-l-4 transition-all",
           userSettings.hasSmoker ? "border-l-orange-500 opacity-100" : "border-l-gray-600 opacity-50 grayscale"
        )}>
           <div className="flex items-center gap-3">
             <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
               <Wind className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-white font-medium">Smoked Cocktail?</h3>
               <p className="text-xs text-muted-foreground">
                  {userSettings.hasSmoker ? "Filter for recipes using your smoker" : "Enable smoker in My Kit to unlock"}
               </p>
             </div>
           </div>
           <button 
             onClick={() => userSettings.hasSmoker && setPreferences(p => ({ ...p, smoked: !p.smoked }))}
             disabled={!userSettings.hasSmoker}
             className={cn(
               "w-12 h-6 rounded-full transition-colors relative",
               preferences.smoked ? "bg-orange-500" : "bg-white/10"
             )}
           >
             <div className={cn(
               "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
               preferences.smoked ? "translate-x-6" : "translate-x-0"
             )} />
           </button>
        </div>

        <button 
          onClick={handleGenerate}
          className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" /> Generate Recipe
        </button>
      </div>
    </div>
  );
}
