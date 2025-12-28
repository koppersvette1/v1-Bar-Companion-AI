import { useState } from "react";
import { Utensils, Search, ArrowRight, Loader2 } from "lucide-react";
import cocktailImage from '@assets/generated_images/classic_old_fashioned_cocktail.png';
import { getPairing } from "@/lib/logic";

export default function Pair() {
  const [mode, setMode] = useState<'food-to-drink' | 'drink-to-food'>('food-to-drink');
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePair = async () => {
    if(!input) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // Fake API delay
    const match = getPairing(input, mode);
    setResult(match);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 h-full flex flex-col">
       <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-bold text-white">The Perfect Pair</h1>
        <p className="text-muted-foreground">Find the culinary soulmate for your drink or dish.</p>
      </div>

      <div className="glass-card p-1 rounded-full bg-black/20 backdrop-blur-md flex mx-auto max-w-md w-full">
        <button 
          onClick={() => { setMode('food-to-drink'); setResult(null); setInput(""); }}
          className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${mode === 'food-to-drink' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
        >
          I have Food
        </button>
        <button 
           onClick={() => { setMode('drink-to-food'); setResult(null); setInput(""); }}
           className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${mode === 'drink-to-food' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
        >
          I have a Drink
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full space-y-8">
        {!result ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <label className="text-lg font-serif font-medium text-white text-center block">
              {mode === 'food-to-drink' ? "What are you eating?" : "What are you drinking?"}
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'food-to-drink' ? "e.g., Spicy Tacos, Steak, Chocolate Cake..." : "e.g., Old Fashioned, Margarita..."}
                className="w-full bg-card/50 border border-white/10 rounded-2xl p-6 text-xl text-center text-white placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-xl"
                onKeyDown={(e) => e.key === 'Enter' && handlePair()}
              />
              <button 
                onClick={handlePair}
                disabled={!input || loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl text-center space-y-6 animate-in zoom-in-95 duration-500 border-primary/20 bg-gradient-to-b from-card/80 to-card/40">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
              <Utensils className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Best Match</p>
              <h2 className="text-3xl font-serif font-bold text-white">{result.match}</h2>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">{result.description}</p>
            
            <button 
              onClick={() => { setResult(null); setInput(""); }} 
              className="text-sm text-white/50 hover:text-white transition-colors underline decoration-dotted"
            >
              Try another pairing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
