import { useState, useEffect } from "react";
import { useStore, Wood } from "@/lib/store";
import { Flame, Timer, AlertCircle, Info, Wind, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SmokerMode() {
  const { woodLibrary, userSettings, toggleWoodInKit } = useStore();
  const [selectedWood, setSelectedWood] = useState<Wood | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'smoking' | 'resting' | 'done'>('idle');

  const myWoods = woodLibrary.filter(w => w.isInMyKit);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      // Phase transition
      if (phase === 'smoking') {
        setPhase('resting');
        setTimeLeft(25); // Standard rest time
      } else if (phase === 'resting') {
        setPhase('done');
        setTimerActive(false);
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, phase]);

  const startSmoke = (wood: Wood) => {
    setSelectedWood(wood);
    setPhase('smoking');
    setTimeLeft(wood.recommendedTimeSecondsMin); // Start with min recommended
    setTimerActive(true);
  };

  const reset = () => {
    setPhase('idle');
    setTimerActive(false);
    setTimeLeft(0);
  };

  if (!userSettings.hasSmoker) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center">
          <Flame className="w-10 h-10 text-orange-500" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-serif font-bold text-white">Enable Smoker Mode</h2>
          <p className="text-muted-foreground">Unlock the full flavor potential of your bar. If you own a cocktail smoker, enable it to get wood pairing recommendations and guided timers.</p>
        </div>
        <button className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all">
          I have a Smoker
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
            <Wind className="w-8 h-8 text-muted-foreground" />
            Smoker Lab
          </h1>
          <p className="text-muted-foreground">Guided smoking sessions and wood pairings.</p>
        </div>
      </div>

      {/* ACTIVE SESSION */}
      {phase !== 'idle' ? (
        <div className="glass-card p-8 rounded-3xl border-orange-500/30 bg-gradient-to-b from-card to-background relative overflow-hidden">
          {/* Background Pulse */}
          {timerActive && phase === 'smoking' && (
             <div className="absolute inset-0 bg-orange-500/5 animate-pulse" />
          )}

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs uppercase tracking-wider border border-orange-500/20">
              {phase === 'smoking' ? 'Apply Smoke' : phase === 'resting' ? 'Rest & infuse' : 'Ready to Serve'}
            </div>

            <div className="relative">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle 
                  cx="96" cy="96" r="88" 
                  stroke="currentColor" strokeWidth="8" 
                  fill="transparent" 
                  className={phase === 'smoking' ? "text-orange-500 transition-all duration-1000" : "text-blue-500 transition-all duration-1000"}
                  strokeDasharray={552}
                  strokeDashoffset={552 - (552 * timeLeft) / (phase === 'smoking' ? (selectedWood?.recommendedTimeSecondsMin || 15) : 25)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-6xl font-bold font-mono text-white">{timeLeft}s</span>
                <span className="text-xs text-muted-foreground uppercase mt-2">{selectedWood?.name}</span>
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-bold text-white">
                {phase === 'smoking' ? "Torch the wood chips" : phase === 'resting' ? "Let the smoke settle" : "Remove smoker & enjoy"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {phase === 'smoking' ? "Keep the torch moving. Fill the glass until opaque." : phase === 'resting' ? "This allows the harshest phenols to dissipate." : "Garnish immediately to trap the aroma."}
              </p>
            </div>

            {phase === 'done' ? (
               <button onClick={reset} className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all">
                 Finish Session
               </button>
            ) : (
               <button onClick={reset} className="text-muted-foreground hover:text-white text-sm flex items-center gap-2">
                 <RotateCcw className="w-4 h-4" /> Cancel
               </button>
            )}
          </div>
        </div>
      ) : (
        /* WOOD SELECTOR */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {woodLibrary.map((wood) => (
              <div 
                key={wood.name} 
                className={cn(
                  "group relative p-6 rounded-2xl border transition-all hover:shadow-lg cursor-pointer",
                  wood.isInMyKit 
                    ? "bg-card/40 border-white/10 hover:border-primary/50" 
                    : "bg-black/20 border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                )}
                onClick={() => wood.isInMyKit && startSmoke(wood)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-primary transition-colors">{wood.name}</h3>
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider mt-1",
                      wood.intensity === 'light' ? 'text-green-400' :
                      wood.intensity === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    )}>
                      {wood.intensity} Intensity
                    </span>
                  </div>
                  {!wood.isInMyKit && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWoodInKit(wood.name); }}
                      className="text-xs bg-white/10 px-2 py-1 rounded text-white hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      + Add to Kit
                    </button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">{wood.tastingNotes}</p>
                
                <div className="flex flex-wrap gap-2">
                  {wood.bestWithFoodTags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded bg-black/40 text-muted-foreground border border-white/5 capitalize">
                      {tag}
                    </span>
                  ))}
                </div>

                {wood.isInMyKit && (
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="glass-card p-6 rounded-2xl flex gap-4 items-start border-l-4 border-l-blue-500">
             <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
             <div className="space-y-1">
               <h4 className="font-bold text-white text-sm">Pro Tip: The Golden Rule of Smoke</h4>
               <p className="text-sm text-muted-foreground">Smoke adheres best to chilled surfaces and moisture. Always chill your glass before smoking, and consider expressing a citrus peel *after* the smoke clears to brighten the flavor.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
