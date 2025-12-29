import { useState } from "react";
import { useStore } from "@/lib/store";
import { UtensilsCrossed, ArrowRight, Wind } from "lucide-react";
import { generatePairing } from "@/lib/logic/pairing";
import { cn } from "@/lib/utils";

export default function Pair() {
  const [mode, setMode] = useState<'meal-to-drink'|'drink-to-meal'>('meal-to-drink');
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  
  const { woodLibrary, settings } = useStore();

  const handlePair = () => {
    if(!input) return;
    const res = generatePairing(input, mode, {
      hasSmoker: settings.hasSmoker,
      availableWoods: woodLibrary.filter(w => w.isInMyKit)
    });
    setResult(res);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-safe">
       <div className="text-center">
         <h1 className="mb-2" data-testid="text-page-title">Pairing Lab</h1>
         <p style={{ color: 'var(--muted-text)' }}>Discover flavor affinities.</p>
       </div>

       {/* Mode Toggle */}
       <div className="p-1.5 rounded-full flex" style={{ background: 'var(--surface2)', border: '1px solid var(--border-color)' }}>
         <button 
           onClick={() => setMode('meal-to-drink')} 
           className={cn("flex-1 py-3 rounded-full font-semibold tab-transition touch-target")}
           style={{ 
             background: mode === 'meal-to-drink' ? 'var(--accent)' : 'transparent',
             color: mode === 'meal-to-drink' ? 'var(--bg)' : 'var(--muted-text)',
             boxShadow: mode === 'meal-to-drink' ? 'var(--shadow-glow)' : 'none'
           }}
           data-testid="button-mode-meal-to-drink"
         >
           Meal → Drink
         </button>
         <button 
           onClick={() => setMode('drink-to-meal')} 
           className={cn("flex-1 py-3 rounded-full font-semibold tab-transition touch-target")}
           style={{ 
             background: mode === 'drink-to-meal' ? 'var(--accent)' : 'transparent',
             color: mode === 'drink-to-meal' ? 'var(--bg)' : 'var(--muted-text)',
             boxShadow: mode === 'drink-to-meal' ? 'var(--shadow-glow)' : 'none'
           }}
           data-testid="button-mode-drink-to-meal"
         >
           Drink → Meal
         </button>
       </div>

       {/* Input */}
       <div className="relative">
         <input 
           value={input}
           onChange={e => setInput(e.target.value)}
           placeholder={mode === 'meal-to-drink' ? "e.g. Ribeye, Thai Curry..." : "e.g. Cabernet, Old Fashioned..."}
           className="input-speakeasy w-full rounded-2xl p-5 text-lg text-center"
           onKeyDown={e => e.key === 'Enter' && handlePair()}
           data-testid="input-pairing"
         />
         <button 
           onClick={handlePair} 
           className="absolute right-4 top-1/2 -translate-y-1/2 btn-brass p-3 rounded-full touch-target"
           data-testid="button-pair"
         >
           <ArrowRight className="w-5 h-5" />
         </button>
       </div>

       {/* Result */}
       {result && (
         <div className="card-speakeasy p-8 text-center scale-in" data-testid="card-result">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 brass-glow" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--success) 100%)' }}>
              <UtensilsCrossed className="w-8 h-8" style={{ color: 'var(--bg)' }} />
            </div>
            
            <h2 className="mb-3">{result.match}</h2>
            <p className="mb-6" style={{ color: 'var(--muted-text)' }}>{result.reason}</p>

            {result.woodRecommendation && (
              <div className="rounded-xl p-4 text-left flex gap-3" style={{ background: 'rgba(198, 161, 91, 0.1)', border: '1px solid rgba(198, 161, 91, 0.2)' }}>
                 <Wind className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                 <div>
                   <p className="font-semibold mb-1" style={{ color: 'var(--accent)' }}>Smoker Pairing</p>
                   <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
                     Try {result.woodRecommendation.wood}: {result.woodRecommendation.reason}
                   </p>
                 </div>
              </div>
            )}
         </div>
       )}
    </div>
  );
}
