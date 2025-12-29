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
    <div className="max-w-xl mx-auto space-y-8 pb-24">
       <div className="text-center">
         <h1 className="text-3xl font-display font-semibold tracking-wide mb-2" style={{ color: 'var(--text)' }} data-testid="text-page-title">
           Pairing Lab
         </h1>
         <p style={{ color: 'var(--muted-text)' }}>Discover flavor affinities.</p>
       </div>

       {/* Mode Toggle */}
       <div className="p-1 rounded-full flex" style={{ background: 'var(--surface2)', border: '1px solid var(--border-color)' }}>
         <button 
           onClick={() => setMode('meal-to-drink')} 
           className={cn("flex-1 py-2 rounded-full text-sm font-semibold transition-all")}
           style={{ 
             background: mode === 'meal-to-drink' ? 'var(--accent)' : 'transparent',
             color: mode === 'meal-to-drink' ? 'var(--bg)' : 'var(--muted-text)'
           }}
           data-testid="button-mode-meal-to-drink"
         >
           Meal → Drink
         </button>
         <button 
           onClick={() => setMode('drink-to-meal')} 
           className={cn("flex-1 py-2 rounded-full text-sm font-semibold transition-all")}
           style={{ 
             background: mode === 'drink-to-meal' ? 'var(--accent)' : 'transparent',
             color: mode === 'drink-to-meal' ? 'var(--bg)' : 'var(--muted-text)'
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
           className="input-speakeasy w-full rounded-2xl p-6 text-xl text-center"
           onKeyDown={e => e.key === 'Enter' && handlePair()}
           data-testid="input-pairing"
         />
         <button 
           onClick={handlePair} 
           className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors"
           style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-color)' }}
           data-testid="button-pair"
         >
           <ArrowRight className="w-5 h-5" />
         </button>
       </div>

       {/* Result */}
       {result && (
         <div className="card-speakeasy p-8 text-center animate-in zoom-in-95" data-testid="card-result">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--success) 100%)' }}>
              <UtensilsCrossed className="w-8 h-8" style={{ color: 'var(--bg)' }} />
            </div>
            
            <h2 className="text-2xl font-display font-semibold tracking-wide mb-2" style={{ color: 'var(--text)' }}>{result.match}</h2>
            <p className="mb-6" style={{ color: 'var(--muted-text)' }}>{result.reason}</p>

            {result.woodRecommendation && (
              <div className="rounded-xl p-4 text-left flex gap-3" style={{ background: 'rgba(198, 161, 91, 0.1)', border: '1px solid rgba(198, 161, 91, 0.2)' }}>
                 <Wind className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                 <div>
                   <h4 className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>Smoker Pairing</h4>
                   <p className="text-xs mt-1" style={{ color: 'var(--muted-text)' }}>
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
