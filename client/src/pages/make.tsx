import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Sparkles, GlassWater, Loader2, ChevronRight, RefreshCw, ChefHat, Wind, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { findMatch } from "@/lib/logic";
import { Link } from "wouter";

export default function Make() {
  const [step, setStep] = useState<'preferences' | 'generating' | 'result'>('preferences');
  const [preferences, setPreferences] = useState({
    base: '',
    style: '',
    sweetness: 'balanced',
    smoked: false,
  });
  const [recipe, setRecipe] = useState<any>(null);
  
  const { inventory, settings } = useStore();
  const hasSmoker = inventory.some(i => i.name.toLowerCase().includes('smoker'));

  const handleGenerate = async () => {
    setStep('generating');
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 2000));
    
    // Use fallback logic for now (later can swap with OpenAI)
    const result = findMatch(inventory, preferences);
    setRecipe(result);
    setStep('result');
  };

  if (step === 'generating') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">Consulting the Archives...</h2>
          <p className="text-muted-foreground">Analyzing your {inventory.length} ingredients for the perfect match.</p>
        </div>
      </div>
    );
  }

  if (step === 'result' && recipe) {
    return (
      <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-8 duration-700">
        <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden group">
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">{recipe.name}</h1>
            <p className="text-white/80 max-w-lg">{recipe.description}</p>
          </div>
          <button 
            onClick={() => setStep('preferences')}
            className="absolute top-4 left-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
             <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-serif font-bold text-primary border-b border-primary/20 pb-2">Ingredients</h3>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ing: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {ing}
                    </li>
                  ))}
                </ul>
             </div>
             
             {preferences.smoked && (
                <div className="glass-card p-6 rounded-2xl space-y-4 border-l-4 border-l-orange-500 bg-orange-500/5">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Wind className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Smoke Profile</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{recipe.tips}</p>
                </div>
             )}

             {!settings.useOpenAi && (
               <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3 items-start">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground">Running in local demo mode. Add an OpenAI key in settings for unlimited AI recipes.</p>
               </div>
             )}
          </div>

          <div className="md:col-span-2 glass-card p-8 rounded-2xl">
            <h3 className="text-2xl font-serif font-bold text-white mb-6">Preparation</h3>
            <div className="space-y-8">
              {recipe.steps.map((step: string, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-serif">
                    {i + 1}
                  </div>
                  <p className="text-white/80 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
               <ChefHat className="w-5 h-5" /> Start Interactive Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state handling
  if (inventory.length === 0) {
    return (
       <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
         <h2 className="text-2xl font-serif font-bold text-white">Your bar is empty.</h2>
         <p className="text-muted-foreground">We need ingredients to make drinks.</p>
         <Link href="/inventory">
           <a className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold">Go to Inventory</a>
         </Link>
       </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-bold text-white">Bartender's Choice</h1>
        <p className="text-muted-foreground">Tell us what you're in the mood for, and we'll craft a custom recipe from your inventory.</p>
      </div>

      <div className="space-y-6">
        {/* Base Spirit */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-white uppercase tracking-wider">Base Spirit</label>
          <div className="grid grid-cols-3 gap-3">
            {['Whiskey', 'Gin', 'Vodka', 'Rum', 'Tequila', 'Surprise Me'].map((opt) => (
              <button
                key={opt}
                onClick={() => setPreferences({ ...preferences, base: opt })}
                className={cn(
                  "p-4 rounded-xl border transition-all text-sm font-medium",
                  preferences.base === opt
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
          <label className="text-sm font-bold text-white uppercase tracking-wider">Style</label>
          <div className="grid grid-cols-2 gap-3">
             {[
               { id: 'stirred', label: 'Stirred & Boozy', desc: 'Spirit-forward, elegant' },
               { id: 'sour', label: 'Sour & Refreshing', desc: 'Citrusy, bright, shaken' },
               { id: 'highball', label: 'Tall & Bubbly', desc: 'Long drink, effervescent' },
               { id: 'tiki', label: 'Tropical & Fruity', desc: 'Complex, layered, fun' },
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
        {hasSmoker && (
          <div className="glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-orange-500">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                 <Wind className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="text-white font-medium">Use Cocktail Smoker?</h3>
                 <p className="text-xs text-muted-foreground">We'll adjust the recipe for smoke.</p>
               </div>
             </div>
             <button 
               onClick={() => setPreferences(p => ({ ...p, smoked: !p.smoked }))}
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
        )}

        <button 
          onClick={handleGenerate}
          disabled={!preferences.base || !preferences.style}
          className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" /> Generate Recipe
        </button>
      </div>
    </div>
  );
}
