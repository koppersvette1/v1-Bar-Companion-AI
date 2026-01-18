import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Sparkles, ArrowRight, CheckCircle2, FlaskConical, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const { loadSeedData } = useStore();

  const steps = [
    {
      title: "Welcome to My Bar AI",
      desc: "Your intelligent home bartender. Let's get your bar set up so you can start mixing.",
      icon: Sparkles
    },
    {
      title: "Step 1: Inventory",
      desc: "Add your spirits, mixers, and tools. Or load our demo bar to start instantly.",
      icon: FlaskConical
    },
    {
      title: "Step 2: Generate",
      desc: "Tell us what you're craving. We'll design a recipe using ONLY what you have.",
      icon: CheckCircle2
    },
    {
      title: "Step 3: Pair",
      desc: "Find the perfect food match for your drink, or vice-versa.",
      icon: UtensilsCrossed
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const handleLoadDemo = () => {
    loadSeedData();
    onComplete();
  };

  const CurrentIcon = steps[step].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-card border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Progress */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="flex flex-col items-center text-center space-y-6 pt-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-in fade-in zoom-in duration-500 key={step}">
            <CurrentIcon className="w-8 h-8" />
          </div>

          <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500 key={step}">
            <h2 className="text-2xl font-serif font-bold text-white">{steps[step].title}</h2>
            <p className="text-muted-foreground leading-relaxed">{steps[step].desc}</p>
          </div>

          <div className="flex flex-col gap-3 w-full pt-8">
            <button 
              onClick={handleNext}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {step === steps.length - 1 ? "Get Started" : "Next"} <ArrowRight className="w-4 h-4" />
            </button>
            
            {step === 1 && (
              <button 
                onClick={handleLoadDemo}
                className="w-full py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10"
              >
                Skip & Load Demo Bar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
