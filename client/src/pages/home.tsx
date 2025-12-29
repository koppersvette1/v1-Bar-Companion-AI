import { useStore } from "@/lib/store";
import { ArrowRight, Sparkles, Plus, FlaskConical, Flame, User, Info } from "lucide-react";
import { Link } from "wouter";
import bgImage from '@assets/generated_images/elegant_home_bar_background.png';
import Onboarding from "@/components/onboarding";
import { useState } from "react";
import AddItemModal from "@/components/add-item-modal";
import { cn } from "@/lib/utils";

export default function Home() {
  const { inventory, userSettings, updateSettings, loadDemoData } = useStore();
  const [showAddItem, setShowAddItem] = useState(false);
  
  // Simple check for onboarding state (mocked)
  const [hasOnboarded, setHasOnboarded] = useState(false);

  if (!hasOnboarded && inventory.length === 0) {
    return <Onboarding onComplete={() => setHasOnboarded(true)} />;
  }
  
  return (
    <div className="space-y-8">
      <AddItemModal open={showAddItem} onOpenChange={setShowAddItem} />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-card border-none min-h-[350px] flex items-center justify-center p-8 text-center group">
        <div className="absolute inset-0 z-0">
          {inventory.length > 0 ? (
            <img src={bgImage} alt="Bar Background" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[2s]" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-card to-background opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-lg mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-white uppercase tracking-widest">
              Welcome, {userSettings.name}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-lg leading-tight">
            {inventory.length === 0 ? "Let's build your bar." : "What are we drinking tonight?"}
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {inventory.length > 0 ? (
              <>
                <Link href="/make">
                  <a className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                    <Sparkles className="w-5 h-5" />
                    Make me a Drink
                  </a>
                </Link>
                <Link href="/smoker">
                  <a className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-panel text-white hover:bg-white/10 rounded-full font-bold transition-all hover:scale-105 active:scale-95">
                    <Flame className="w-5 h-5 text-orange-400" />
                    Smoker Lab
                  </a>
                </Link>
              </>
            ) : (
               <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                 <button 
                  onClick={loadDemoData}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-all"
                 >
                   <FlaskConical className="w-5 h-5" />
                   Load Demo Bar
                 </button>
                 <button 
                   onClick={() => setShowAddItem(true)}
                   className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 glass-panel text-white hover:bg-white/10 rounded-full font-bold"
                 >
                   <Plus className="w-5 h-5" />
                   Add First Bottle
                 </button>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      {inventory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 delay-100">
          
          {/* Quick Stats */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">My Inventory</span>
              <Link href="/inventory"><a className="text-xs text-primary hover:underline">Manage</a></Link>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-serif font-bold text-white">{inventory.length}</span>
              <span className="text-sm text-muted-foreground">items</span>
            </div>
          </div>

          {/* Smoker Status */}
          <Link href="/smoker">
            <a className={cn(
              "glass-card p-6 rounded-2xl flex flex-col justify-between transition-all hover:bg-white/5 group border-l-4",
              userSettings.hasSmoker ? "border-l-orange-500" : "border-l-transparent"
            )}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-orange-400 transition-colors">Smoker Status</span>
                <Flame className={cn("w-4 h-4", userSettings.hasSmoker ? "text-orange-500" : "text-muted-foreground")} />
              </div>
              <div>
                 <h3 className="font-bold text-white mb-1">
                   {userSettings.hasSmoker ? "Ready to Smoke" : "Smoker Not Detected"}
                 </h3>
                 <p className="text-xs text-muted-foreground">
                   {userSettings.hasSmoker ? "Tap to start a session" : "Tap to enable smoker mode"}
                 </p>
              </div>
            </a>
          </Link>

          {/* Pairing */}
          <Link href="/pair">
            <a className="glass-card p-6 rounded-2xl flex flex-col justify-between transition-all hover:bg-white/5 group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">Pairing Lab</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                 <h3 className="font-bold text-white mb-1">Find a Match</h3>
                 <p className="text-xs text-muted-foreground">Pair drinks with your dinner.</p>
              </div>
            </a>
          </Link>

        </div>
      )}

      <div className="flex justify-center pt-8 opacity-50">
        <p className="text-[10px] text-muted-foreground text-center max-w-sm">
          BarBuddy v2.0 (Prototype) • Designed for Mixologists
        </p>
      </div>
    </div>
  );
}
