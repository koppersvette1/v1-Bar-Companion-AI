import { useState } from "react";
import { useStore } from "@/lib/store";
import { UtensilsCrossed, Search, ArrowRight, Info, Wine, Wind } from "lucide-react";
import { generatePairing } from "@/lib/logic/pairing";
import { cn } from "@/lib/utils";

export default function Pair() {
  const [mode, setMode] = useState<'meal-to-drink'|'drink-to-meal'>('meal-to-drink');
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  
  const { woodLibrary, userSettings } = useStore();

  const handlePair = () => {
    if(!input) return;
    const res = generatePairing(input, mode, {
      hasSmoker: userSettings.hasSmoker,
      availableWoods: woodLibrary.filter(w => w.isInMyKit)
    });
    setResult(res);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-24">
       <div className="text-center">
         <h1 className="text-3xl font-serif font-bold text-white mb-2">Pairing Lab</h1>
         <p className="text-slate-400">Discover flavor affinities.</p>
       </div>

       <div className="bg-slate-900 p-1 rounded-full flex">
         <button onClick={() => setMode('meal-to-drink')} className={cn("flex-1 py-2 rounded-full text-sm font-bold transition-all", mode === 'meal-to-drink' ? "bg-orange-500 text-white" : "text-slate-500")}>
           Meal → Drink
         </button>
         <button onClick={() => setMode('drink-to-meal')} className={cn("flex-1 py-2 rounded-full text-sm font-bold transition-all", mode === 'drink-to-meal' ? "bg-orange-500 text-white" : "text-slate-500")}>
           Drink → Meal
         </button>
       </div>

       <div className="relative">
         <input 
           value={input}
           onChange={e => setInput(e.target.value)}
           placeholder={mode === 'meal-to-drink' ? "e.g. Ribeye, Thai Curry..." : "e.g. Cabernet, Old Fashioned..."}
           className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-xl text-center text-white focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-600"
           onKeyDown={e => e.key === 'Enter' && handlePair()}
         />
         <button onClick={handlePair} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-800 rounded-full text-white hover:bg-orange-500 transition-colors">
           <ArrowRight className="w-5 h-5" />
         </button>
       </div>

       {result && (
         <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-6">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-serif font-bold text-white mb-2">{result.match}</h2>
            <p className="text-slate-400 mb-6">{result.reason}</p>

            {result.woodRecommendation && (
              <div className="bg-orange-950/30 border border-orange-500/20 rounded-xl p-4 text-left flex gap-3">
                 <Wind className="w-5 h-5 text-orange-500 flex-shrink-0" />
                 <div>
                   <h4 className="font-bold text-orange-400 text-sm">Smoker Pairing</h4>
                   <p className="text-xs text-orange-200/70 mt-1">
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
