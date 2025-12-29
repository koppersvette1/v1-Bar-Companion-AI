import { useStore } from "@/lib/store";
import { Flame, Wind, Play, RotateCcw, Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getSafeSmokeTime } from "@/lib/logic/rules";

export default function Smoker() {
  const { woodLibrary, toggleWoodKit, settings, updateSettings } = useStore();
  const [activeWood, setActiveWood] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'smoking' | 'resting'>('idle');

  useEffect(() => {
    let interval: any;
    if (phase !== 'idle' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (phase === 'smoking' && timer === 0) {
      setPhase('resting');
      setTimer(25);
    } else if (phase === 'resting' && timer === 0) {
      setPhase('idle');
      setActiveWood(null);
    }
    return () => clearInterval(interval);
  }, [phase, timer]);

  const startSession = (woodId: string) => {
    const wood = woodLibrary.find(w => w.id === woodId);
    if (!wood) return;
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
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(198, 161, 91, 0.15)' }}>
          <Flame className="w-12 h-12" style={{ color: 'var(--accent)' }} />
        </div>
        <h2 className="mb-3">Unlock Smoker Mode</h2>
        <p className="max-w-sm mb-6" style={{ color: 'var(--muted-text)' }}>
          Enable this feature to get wood pairings, safety timers, and guided smoking sessions for your cocktails.
        </p>
        <button 
          onClick={() => updateSettings({ hasSmoker: true })}
          className="btn-brass px-6 py-3 rounded-xl touch-target"
          data-testid="button-enable-smoker"
        >
          I Have a Smoker
        </button>
      </div>
    );
  }

  const activeWoodObj = woodLibrary.find(w => w.id === activeWood);

  return (
    <div className="space-y-8 pb-safe">
      
      <div className="flex items-center justify-between">
         <div>
           <h1 className="flex items-center gap-3">
             <Wind className="w-8 h-8" style={{ color: 'var(--muted-text)' }} />
             Smoker Lab
           </h1>
           <p className="mt-1" style={{ color: 'var(--muted-text)' }}>Wood profiles & guided sessions</p>
         </div>
      </div>

      {/* Active Session Card */}
      {phase !== 'idle' && activeWoodObj ? (
        <div className="card-speakeasy p-8 text-center relative overflow-hidden glow-pulse" style={{ borderColor: 'var(--accent)' }}>
           <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(198, 161, 91, 0.05)' }} />
           <div className="relative z-10">
             <div className="badge-brass inline-flex mb-6 text-sm" style={{ background: 'rgba(198, 161, 91, 0.2)' }}>
               {phase === 'smoking' ? 'Apply Smoke' : 'Let it Rest'}
             </div>
             
             <div className="text-7xl md:text-8xl font-mono font-bold mb-3" style={{ color: 'var(--text)' }}>{timer}s</div>
             <p className="mb-8" style={{ color: 'var(--muted-text)' }}>
               {phase === 'smoking' ? `Torching ${activeWoodObj.name} chips...` : "Allowing smoke to infuse..."}
             </p>

             <button onClick={cancelSession} className="btn-ghost flex items-center gap-2 mx-auto px-4 py-2 rounded-lg touch-target">
               <RotateCcw className="w-4 h-4" /> Cancel Session
             </button>
           </div>
        </div>
      ) : (
        /* Wood Library */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {woodLibrary.map(wood => (
            <div key={wood.id} className={cn(
               "card-speakeasy card-hover p-5 relative group",
               !wood.isInMyKit && "opacity-50"
            )} data-testid={`card-wood-${wood.id}`}>
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="mb-1">{wood.name}</h3>
                   <div className="flex items-center gap-2">
                     <span className={cn(
                       "text-[10px] font-semibold uppercase tracking-wider",
                       wood.intensity === 'light' ? "text-[var(--success)]" : 
                       wood.intensity === 'medium' ? "text-[var(--accent)]" : "text-[var(--danger)]"
                     )}>{wood.intensity}</span>
                     {wood.beginnerSafe && (
                       <span className="badge-brass">SAFE</span>
                     )}
                   </div>
                 </div>
                 
                 <button 
                   onClick={() => toggleWoodKit(wood.id)}
                   className={cn("p-2.5 rounded-full tab-transition touch-target")}
                   style={{ 
                     background: wood.isInMyKit ? 'rgba(198, 161, 91, 0.15)' : 'var(--surface2)',
                     color: wood.isInMyKit ? 'var(--accent)' : 'var(--muted-text)'
                   }}
                   data-testid={`button-toggle-kit-${wood.id}`}
                 >
                   {wood.isInMyKit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                 </button>
               </div>

               <p className="mb-4" style={{ color: 'var(--muted-text)' }}>{wood.tastingNotes}</p>
               
               <div className="flex flex-wrap gap-1.5 mb-4">
                 {wood.flavorTags.map(tag => (
                   <span key={tag} className="chip-speakeasy text-xs">{tag}</span>
                 ))}
               </div>
               
               <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                 <div className="text-sm" style={{ color: 'var(--muted-text)' }}>
                   <span className="font-semibold" style={{ color: 'var(--accent)' }}>{wood.timeMin}-{wood.timeMax}s</span> safe range
                 </div>
                 {wood.isInMyKit && (
                   <button 
                     onClick={() => startSession(wood.id)}
                     className="btn-brass px-4 py-2 rounded-lg flex items-center gap-1.5 touch-target"
                     data-testid={`button-start-${wood.id}`}
                   >
                     <Play className="w-4 h-4" /> Start
                   </button>
                 )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
