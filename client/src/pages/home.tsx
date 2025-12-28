import { useStore } from "@/lib/store";
import { ArrowRight, Sparkles, Camera, Plus, FlaskConical } from "lucide-react";
import { Link } from "wouter";
import bgImage from '@assets/generated_images/elegant_home_bar_background.png';
import Onboarding from "@/components/onboarding";
import { useState } from "react";
import AddItemModal from "@/components/add-item-modal";

export default function Home() {
  const { inventory, settings, updateSettings, loadDemoBar } = useStore();
  const [showAddItem, setShowAddItem] = useState(false);

  const handleOnboardingComplete = () => {
    updateSettings({ onboardingCompleted: true });
  };

  if (!settings.onboardingCompleted) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-widest">
              {settings.useOpenAi ? "AI Online" : "Demo Mode Active"}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-lg leading-tight">
            {inventory.length === 0 ? "Let's fill your bar." : "What are we drinking tonight?"}
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
                <button 
                  onClick={() => setShowAddItem(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-panel text-white hover:bg-white/10 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Add Item
                </button>
              </>
            ) : (
               <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                 <button 
                  onClick={loadDemoBar}
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
                   Add First Item
                 </button>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      {inventory.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-100">
          {[
            { label: "Total Bottles", value: inventory.filter(i => i.category === 'spirit' || i.category === 'liqueur').length },
            { label: "Possible Drinks", value: Math.floor(inventory.length * 1.5) }, // Fake calc for demo
            { label: "Newest Addition", value: inventory[inventory.length - 1]?.name || "None" },
            { label: "Favorites", value: "3" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl flex flex-col items-start justify-between gap-4 hover:border-primary/30 transition-colors">
              <span className="text-3xl font-serif font-bold text-white truncate w-full">{stat.value}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Featured Suggestion */}
      {inventory.length > 0 && (
        <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-semibold text-white">Suggested for You</h2>
            <Link href="/make">
              <a className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/make">
              <a className="glass-card p-6 rounded-2xl flex gap-6 items-center hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="w-24 h-24 rounded-xl bg-muted/20 overflow-hidden shrink-0">
                   <div className="w-full h-full bg-gradient-to-br from-amber-900 to-amber-600 opacity-80" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase">Whiskey</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 uppercase">Smoked</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Maple Smoked Old Fashioned</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">A rich twist on the classic using maple syrup and hickory smoke.</p>
                </div>
              </a>
            </Link>
            
            <Link href="/make">
               <a className="glass-card p-6 rounded-2xl flex gap-6 items-center hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="w-24 h-24 rounded-xl bg-muted/20 overflow-hidden shrink-0">
                   <div className="w-full h-full bg-gradient-to-br from-red-900 to-red-600 opacity-80" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase">Gin</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Negroni Sbagliato</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">With prosecco in it. Stunningly refreshing.</p>
                </div>
              </a>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
