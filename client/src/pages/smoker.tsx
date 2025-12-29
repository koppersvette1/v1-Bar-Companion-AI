import { useStore } from "@/lib/store";
import { Flame, Wind, Play, Info, RotateCcw, Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getSafeSmokeTime } from "@/lib/logic/rules";

export default function Smoker() {
  const { woodLibrary, toggleWoodKit, settings, updateSettings } = useStore();
  const [activeWood, setActiveWood] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'smoking' | 'resting'>('idle');

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (phase !== 'idle' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (phase === 'smoking' && timer === 0) {
      setPhase('resting');
      setTimer(25); // Standard rest
    } else if (phase === 'resting' && timer === 0) {
      setPhase('idle');
      setActiveWood(null);
    }
    return () => clearInterval(interval);
  }, [phase, timer]);

  const startSession = (woodId: string) => {
    const wood = woodLibrary.find(w => w.id === woodId);
    if (!wood) return;
    
    // Use rules for safe time
    const safeTime = getSafeSmokeTime(wood.name, wood.intensity);
    
    setActiveWood(woodId);
    setPhase('smoking');
    setTimer(safeTime);
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
        >
          I have a Smoker
        </button>
      </div>
    );
  }

  const activeWoodObj = woodLibrary.find(w => w.id === activeWood);

  return (
    <div className="space-y-8 pb-20">
      
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-2">
             <Wind className="w-8 h-8 text-slate-400" />
             Smoker Lab
           </h1>
           <p className="text-slate-400 text-sm">Wood profiles & guided sessions</p>
         </div>
      </div>

      {/* Active Session Card */}
      {phase !== 'idle' && activeWoodObj ? (
        <div className="bg-gradient-to-br from-orange-950/50 to-slate-900 border border-orange-500/30 rounded-3xl p-8 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-orange-500/5 animate-pulse" />
           <div className="relative z-10">
             <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold uppercase rounded-full mb-6">
               {phase === 'smoking' ? 'Apply Smoke' : 'Let it Rest'}
             </div>
             
             <div className="text-8xl font-mono font-bold text-white mb-2">{timer}s</div>
             <p className="text-slate-400 mb-8">
               {phase === 'smoking' ? `Torching ${activeWoodObj.name} chips...` : "Allowing smoke to infuse..."}
             </p>

             <button onClick={cancelSession} className="flex items-center gap-2 mx-auto text-slate-500 hover:text-white text-sm">
               <RotateCcw className="w-4 h-4" /> Cancel Session
             </button>
           </div>
        </div>
      ) : (
        /* Wood Library */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {woodLibrary.map(wood => (
            <div key={wood.id} className={cn(
               "p-6 rounded-2xl border transition-all relative group",
               wood.isInMyKit ? "bg-slate-900 border-slate-800 hover:border-orange-500/50" : "bg-slate-950 border-slate-900 opacity-60"
            )}>
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="text-xl font-bold font-serif text-white">{wood.name}</h3>
                   <div className="flex items-center gap-2 mt-1">
                     <span className={cn(
                       "text-[10px] font-bold uppercase tracking-wider",
                       wood.intensity === 'light' ? "text-green-400" : 
                       wood.intensity === 'medium' ? "text-yellow-400" : "text-red-400"
                     )}>{wood.intensity}</span>
                     {wood.beginnerSafe && <span className="text-[10px] text-slate-500 border border-slate-800 px-1 rounded">SAFE</span>}
                   </div>
                 </div>
                 
                 <button 
                   onClick={() => toggleWoodKit(wood.id)}
                   className={cn("p-2 rounded-full", wood.isInMyKit ? "text-orange-500 bg-orange-500/10" : "text-slate-600 hover:text-slate-400")}
                 >
                   {wood.isInMyKit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                 </button>
               </div>

               <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">{wood.tastingNotes}</p>

               <div className="flex flex-wrap gap-1.5 mb-4">
                  {wood.flavorTags.slice(0,3).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded capitalize">{t}</span>
                  ))}
               </div>

               {wood.isInMyKit && (
                 <button 
                   onClick={() => startSession(wood.id)}
                   className="w-full py-2 bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-300 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                 >
                   <Play className="w-3 h-3" /> Smoke
                 </button>
               )}
            </div>
          ))}
        </div>
      )}
      
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 items-start">
         <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
         <div>
           <h4 className="text-sm font-bold text-blue-400">Safety Cap Active</h4>
           <p className="text-xs text-blue-200/70 mt-1">
             The system automatically caps strong woods like Mesquite to 7s to prevent acrid flavors.
           </p>
         </div>
      </div>
    </div>
  );
}
