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
        <h2 className="text-2xl font-display font-semibold tracking-wide mb-2" style={{ color: 'var(--text)' }}>Unlock Smoker Mode</h2>
        <p className="max-w-sm mb-6" style={{ color: 'var(--muted-text)' }}>
          Enable this feature to get wood pairings, safety timers, and guided smoking sessions for your cocktails.
        </p>
        <button 
          onClick={() => updateSettings({ hasSmoker: true })}
          className="btn-brass px-6 py-3 rounded-xl"
          data-testid="button-enable-smoker"
        >
          I Have a Smoker
        </button>
      </div>
    );
  }

  const activeWoodObj = woodLibrary.find(w => w.id === activeWood);

  return (
    <div className="space-y-8 pb-20">
      
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-display font-semibold tracking-wide flex items-center gap-3" style={{ color: 'var(--text)' }}>
             <Wind className="w-8 h-8" style={{ color: 'var(--muted-text)' }} />
             Smoker Lab
           </h1>
           <p className="text-sm mt-1" style={{ color: 'var(--muted-text)' }}>Wood profiles & guided sessions</p>
         </div>
      </div>

      {/* Active Session Card */}
      {phase !== 'idle' && activeWoodObj ? (
        <div className="card-speakeasy p-8 text-center relative overflow-hidden" style={{ borderColor: 'var(--accent)' }}>
           <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(198, 161, 91, 0.05)' }} />
           <div className="relative z-10">
             <div className="inline-block px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6" style={{ background: 'rgba(198, 161, 91, 0.2)', color: 'var(--accent)' }}>
               {phase === 'smoking' ? 'Apply Smoke' : 'Let it Rest'}
             </div>
             
             <div className="text-8xl font-mono font-bold mb-2" style={{ color: 'var(--text)' }}>{timer}s</div>
             <p className="mb-8" style={{ color: 'var(--muted-text)' }}>
               {phase === 'smoking' ? `Torching ${activeWoodObj.name} chips...` : "Allowing smoke to infuse..."}
             </p>

             <button onClick={cancelSession} className="flex items-center gap-2 mx-auto text-sm hover:opacity-80" style={{ color: 'var(--muted-text)' }}>
               <RotateCcw className="w-4 h-4" /> Cancel Session
             </button>
           </div>
        </div>
      ) : (
        /* Wood Library */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {woodLibrary.map(wood => (
            <div key={wood.id} className={cn(
               "card-speakeasy p-6 relative group transition-all",
               !wood.isInMyKit && "opacity-50"
            )} data-testid={`card-wood-${wood.id}`}>
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="text-xl font-display font-medium" style={{ color: 'var(--text)' }}>{wood.name}</h3>
                   <div className="flex items-center gap-2 mt-1">
                     <span className={cn(
                       "text-[10px] font-semibold uppercase tracking-wider",
                       wood.intensity === 'light' ? "text-[var(--success)]" : 
                       wood.intensity === 'medium' ? "text-[var(--accent)]" : "text-[var(--danger)]"
                     )}>{wood.intensity}</span>
                     {wood.beginnerSafe && (
                       <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: 'var(--muted-text)', border: '1px solid var(--border-color)' }}>SAFE</span>
                     )}
                   </div>
                 </div>
                 
                 <button 
                   onClick={() => toggleWoodKit(wood.id)}
                   className={cn("p-2 rounded-full transition-colors")}
                   style={{ 
                     background: wood.isInMyKit ? 'rgba(198, 161, 91, 0.15)' : 'var(--surface2)',
                     color: wood.isInMyKit ? 'var(--accent)' : 'var(--muted-text)'
                   }}
                   data-testid={`button-toggle-kit-${wood.id}`}
                 >
                   {wood.isInMyKit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                 </button>
               </div>

               <p className="text-sm mb-4" style={{ color: 'var(--muted-text)' }}>{wood.tastingNotes}</p>
               
               <div className="flex flex-wrap gap-1 mb-4">
                 {wood.flavorTags.map(tag => (
                   <span key={tag} className="chip-speakeasy text-[10px]">{tag}</span>
                 ))}
               </div>
               
               <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                 <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
                   <span className="font-semibold" style={{ color: 'var(--accent)' }}>{wood.timeMin}-{wood.timeMax}s</span> safe range
                 </div>
                 {wood.isInMyKit && (
                   <button 
                     onClick={() => startSession(wood.id)}
                     className="btn-brass px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                     data-testid={`button-start-${wood.id}`}
                   >
                     <Play className="w-3 h-3" /> Start
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
