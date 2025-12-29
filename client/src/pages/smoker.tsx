import { useStore, Wood } from "@/lib/store";
import { Flame, Wind, Play, Info, RotateCcw, Plus, Check, Sparkles, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getSafeSmokeTimeForWood } from "@/lib/logic/rules";

type SmokeMethod = 'cloche' | 'garnish';

export default function Smoker() {
  const { woodLibrary, toggleWoodKit, settings, updateSettings } = useStore();
  const [activeWood, setActiveWood] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'smoking' | 'resting'>('idle');
  const [method, setMethod] = useState<SmokeMethod>('cloche');
  const [filter, setFilter] = useState<'all' | 'mykit'>('all');

  useEffect(() => {
    let interval: any;
    if (phase !== 'idle' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (phase === 'smoking' && timer === 0) {
      setPhase('resting');
      setTimer(method === 'garnish' ? 15 : 25);
    } else if (phase === 'resting' && timer === 0) {
      setPhase('idle');
      setActiveWood(null);
    }
    return () => clearInterval(interval);
  }, [phase, timer, method]);

  const startSession = (woodId: string, selectedMethod: SmokeMethod) => {
    const wood = woodLibrary.find(w => w.id === woodId);
    if (!wood) return;
    
    if (wood.methodRestriction === 'garnishOnly' && selectedMethod !== 'garnish') {
      return;
    }
    
    const safeTime = getSafeSmokeTimeForWood(wood);
    const adjustedTime = selectedMethod === 'garnish' ? Math.min(safeTime, wood.timeMax) : safeTime;
    
    setActiveWood(woodId);
    setMethod(selectedMethod);
    setPhase('smoking');
    setTimer(adjustedTime);
  };

  const cancelSession = () => {
    setPhase('idle');
    setTimer(0);
    setActiveWood(null);
  };

  if (!settings.hasSmoker) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
          <Flame className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Unlock Smoker Mode</h2>
        <p className="text-slate-400 max-w-sm mb-6">
          Enable this feature to get wood pairings, safety timers, and guided smoking sessions for your cocktails.
        </p>
        <button 
          onClick={() => updateSettings({ hasSmoker: true })}
          className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20"
          data-testid="button-enable-smoker"
        >
          I have a Smoker
        </button>
      </div>
    );
  }

  const activeWoodObj = woodLibrary.find(w => w.id === activeWood);
  
  const filteredWoods = filter === 'mykit' 
    ? woodLibrary.filter(w => w.isInMyKit)
    : woodLibrary;

  const regularWoods = filteredWoods.filter(w => !w.methodRestriction);
  const garnishOnlyWoods = filteredWoods.filter(w => w.methodRestriction === 'garnishOnly');

  const getWhyThisWood = (wood: Wood): string => {
    const reasons: string[] = [];
    if (wood.bestWithDrinkTags.length > 0) {
      reasons.push(`Great with ${wood.bestWithDrinkTags.slice(0, 3).join(', ')}`);
    }
    if (wood.bestWithFoodTags.length > 0) {
      reasons.push(`Pairs with ${wood.bestWithFoodTags.slice(0, 2).join(', ')}`);
    }
    return reasons.join('. ') || wood.purpose;
  };

  return (
    <div className="space-y-8 pb-20">
      
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-2" data-testid="text-page-title">
             <Wind className="w-8 h-8 text-slate-400" />
             Smoker Lab
           </h1>
           <p className="text-slate-400 text-sm">Wood profiles & guided sessions</p>
         </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex gap-2">
        <button 
          onClick={() => setFilter('all')}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors",
            filter === 'all' ? "bg-white text-black border-white" : "bg-transparent text-slate-500 border-slate-800"
          )}
          data-testid="button-filter-all"
        >
          All Woods ({woodLibrary.length})
        </button>
        <button 
          onClick={() => setFilter('mykit')}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors",
            filter === 'mykit' ? "bg-white text-black border-white" : "bg-transparent text-slate-500 border-slate-800"
          )}
          data-testid="button-filter-mykit"
        >
          My Kit ({woodLibrary.filter(w => w.isInMyKit).length})
        </button>
      </div>

      {/* Active Session Card */}
      {phase !== 'idle' && activeWoodObj ? (
        <div className="bg-gradient-to-br from-orange-950/50 to-slate-900 border border-orange-500/30 rounded-3xl p-8 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-orange-500/5 animate-pulse" />
           <div className="relative z-10">
             <div className="flex items-center justify-center gap-2 mb-6">
               <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold uppercase rounded-full">
                 {phase === 'smoking' ? 'Apply Smoke' : 'Let it Rest'}
               </span>
               {method === 'garnish' && (
                 <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold uppercase rounded-full">
                   Garnish Method
                 </span>
               )}
             </div>
             
             <div className="text-8xl font-mono font-bold text-white mb-2">{timer}s</div>
             <p className="text-slate-400 mb-8">
               {phase === 'smoking' 
                 ? method === 'garnish' 
                   ? `Torching ${activeWoodObj.name} garnish...` 
                   : `Torching ${activeWoodObj.name} chips...`
                 : "Allowing smoke to infuse..."}
             </p>

             <button onClick={cancelSession} className="flex items-center gap-2 mx-auto text-slate-500 hover:text-white text-sm" data-testid="button-cancel-session">
               <RotateCcw className="w-4 h-4" /> Cancel Session
             </button>
           </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Regular Woods */}
          {regularWoods.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Smoke Woods
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularWoods.map(wood => (
                  <WoodCard 
                    key={wood.id} 
                    wood={wood} 
                    onToggleKit={() => toggleWoodKit(wood.id)}
                    onStartSession={(m) => startSession(wood.id, m)}
                    getWhyThisWood={getWhyThisWood}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Garnish Only Woods */}
          {garnishOnlyWoods.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Garnish Aromatics
                <span className="text-xs text-slate-500 font-normal ml-2">Burn briefly for aroma only</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {garnishOnlyWoods.map(wood => (
                  <WoodCard 
                    key={wood.id} 
                    wood={wood} 
                    onToggleKit={() => toggleWoodKit(wood.id)}
                    onStartSession={(m) => startSession(wood.id, m)}
                    getWhyThisWood={getWhyThisWood}
                    garnishOnly
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 items-start">
         <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
         <div>
           <h4 className="text-sm font-bold text-blue-400">Safety Cap Active</h4>
           <p className="text-xs text-blue-200/70 mt-1">
             The system automatically caps strong woods like Mesquite to 7s to prevent acrid flavors. Garnish aromatics use shorter times.
           </p>
         </div>
      </div>
    </div>
  );
}

function WoodCard({ 
  wood, 
  onToggleKit, 
  onStartSession,
  getWhyThisWood,
  garnishOnly = false
}: { 
  wood: Wood; 
  onToggleKit: () => void; 
  onStartSession: (method: SmokeMethod) => void;
  getWhyThisWood: (wood: Wood) => string;
  garnishOnly?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div 
      className={cn(
        "p-6 rounded-2xl border transition-all relative group",
        wood.isInMyKit 
          ? garnishOnly 
            ? "bg-purple-950/20 border-purple-900/50 hover:border-purple-500/50" 
            : "bg-slate-900 border-slate-800 hover:border-orange-500/50" 
          : "bg-slate-950 border-slate-900 opacity-60"
      )}
      data-testid={`card-wood-${wood.id}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold font-serif text-white">{wood.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              wood.intensity === 'light' ? "text-green-400" : 
              wood.intensity === 'medium' ? "text-yellow-400" : 
              wood.intensity === 'bold' ? "text-orange-400" : "text-red-400"
            )}>{wood.intensity}</span>
            {wood.beginnerSafe && <span className="text-[10px] text-slate-500 border border-slate-800 px-1 rounded">SAFE</span>}
            {garnishOnly && (
              <span className="text-[10px] text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded font-bold">
                GARNISH
              </span>
            )}
          </div>
        </div>
        
        <button 
          onClick={onToggleKit}
          className={cn("p-2 rounded-full", wood.isInMyKit ? "text-orange-500 bg-orange-500/10" : "text-slate-600 hover:text-slate-400")}
          data-testid={`button-toggle-${wood.id}`}
        >
          {wood.isInMyKit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-sm text-slate-400 line-clamp-2 mb-3">{wood.tastingNotes}</p>
      
      {/* Time Range */}
      <p className="text-[10px] text-slate-500 mb-3">
        Recommended: {wood.timeMin}-{wood.timeMax}s
      </p>

      {/* Flavor Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {wood.flavorTags.slice(0, 4).map(t => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded capitalize">{t}</span>
        ))}
      </div>

      {/* Why This Wood (expandable) */}
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="text-[10px] text-orange-400 hover:text-orange-300 mb-3 flex items-center gap-1"
        data-testid={`button-why-${wood.id}`}
      >
        <Sparkles className="w-3 h-3" />
        {showDetails ? 'Hide details' : 'Why this wood?'}
      </button>

      {showDetails && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-300 animate-in slide-in-from-top-2">
          <p className="mb-2">{getWhyThisWood(wood)}</p>
          {wood.avoidWithDrinkTags.length > 0 && (
            <p className="text-slate-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              Avoid with: {wood.avoidWithDrinkTags.join(', ')}
            </p>
          )}
        </div>
      )}

      {wood.isInMyKit && (
        <div className="space-y-2">
          {garnishOnly ? (
            <>
              <button 
                onClick={() => onStartSession('garnish')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                data-testid={`button-smoke-${wood.id}`}
              >
                <Sparkles className="w-3 h-3" /> Torch Garnish
              </button>
              <p className="text-[10px] text-center text-slate-500">
                This aromatic is for garnish smoking only
              </p>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onStartSession('cloche')}
                className="py-2 bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-300 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                data-testid={`button-cloche-${wood.id}`}
              >
                <Play className="w-3 h-3" /> Cloche
              </button>
              <button 
                onClick={() => onStartSession('garnish')}
                className="py-2 bg-slate-800 hover:bg-purple-500 hover:text-white text-slate-300 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                data-testid={`button-garnish-${wood.id}`}
              >
                <Sparkles className="w-3 h-3" /> Garnish
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
