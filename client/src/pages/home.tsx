import { useStore } from "@/lib/store";
import { Link } from "wouter";
import { ScanLine, FlaskConical, Flame, Sparkles, UtensilsCrossed, ArrowRight } from "lucide-react";
import { useState } from "react";
import AddItemModal from "@/components/add-item-modal";
import { cn } from "@/lib/utils";

export default function Home() {
  const { inventory, settings, loadSeedData } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-8 pb-24">
      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl card-speakeasy min-h-[350px] flex items-center justify-center p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--surface2)] z-0" />
        <div className="absolute inset-0 opacity-5 z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C6A15B' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative z-10 max-w-md space-y-6">
           {/* Deco Badge */}
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'var(--surface2)', border: '1px solid var(--border-color)' }}>
             <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
             <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
               Hybrid Intelligence
             </span>
             <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
           </div>
           
           <h1 className="text-4xl md:text-5xl font-display font-semibold leading-tight tracking-wide" style={{ color: 'var(--text)' }}>
             {inventory.length === 0 ? "Let's Build Your Bar" : "What Are We Drinking?"}
           </h1>

           <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {inventory.length === 0 ? (
                <>
                  <button 
                    onClick={loadSeedData} 
                    className="btn-brass px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                    data-testid="button-load-demo"
                  >
                    <FlaskConical className="w-5 h-5" /> Load Demo Data
                  </button>
                  <button 
                    onClick={() => setShowAddModal(true)} 
                    className="btn-outline-brass px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                    data-testid="button-scan-bottle"
                  >
                    <ScanLine className="w-5 h-5" /> Scan First Bottle
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/cocktails" 
                    className="btn-brass px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-sm"
                    data-testid="button-generate-drink"
                  >
                    <Sparkles className="w-5 h-5" /> Generate Drink
                  </Link>
                  <Link 
                    href="/smoker"
                    className="btn-outline-brass px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-sm"
                    data-testid="button-smoker-lab"
                  >
                    <Flame className="w-5 h-5" /> Smoker Lab
                  </Link>
                </>
              )}
           </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      {inventory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           
           {/* Inventory Card */}
           <div className="card-speakeasy p-6 hover:border-[var(--accent)]/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 rounded-xl" style={{ background: 'var(--surface2)' }}>
                   <FlaskConical className="w-6 h-6" style={{ color: 'var(--accent2)' }} />
                 </div>
                 <Link 
                   href="/inventory"
                   className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                   style={{ color: 'var(--muted-text)' }}
                   data-testid="link-manage-inventory"
                 >
                   Manage <ArrowRight className="w-3 h-3" />
                 </Link>
              </div>
              <div className="text-3xl font-display font-semibold mb-1" style={{ color: 'var(--text)' }}>{inventory.length}</div>
              <p className="text-sm" style={{ color: 'var(--muted-text)' }}>Bottles & tools in stock</p>
           </div>

           {/* Smoker Status */}
           <Link 
             href="/smoker"
             className="card-speakeasy p-6 hover:border-[var(--accent)]/30 transition-colors group block cursor-pointer"
             data-testid="card-smoker-status"
           >
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 rounded-xl transition-colors" style={{ background: settings.hasSmoker ? 'rgba(198, 161, 91, 0.15)' : 'var(--surface2)' }}>
                   <Flame className={cn("w-6 h-6")} style={{ color: settings.hasSmoker ? 'var(--accent)' : 'var(--muted-text)' }} />
                 </div>
                 {settings.hasSmoker && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />}
              </div>
              <div className="text-lg font-display font-medium mb-1" style={{ color: 'var(--text)' }}>
                {settings.hasSmoker ? "Smoker Ready" : "Setup Smoker"}
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
                {settings.hasSmoker ? "Guided sessions active" : "Enable to unlock features"}
              </p>
           </Link>

           {/* Pairing */}
           <Link 
             href="/pair"
             className="card-speakeasy p-6 hover:border-[var(--success)]/30 transition-colors group block cursor-pointer"
             data-testid="card-pairing-lab"
           >
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 rounded-xl" style={{ background: 'rgba(31, 107, 74, 0.15)' }}>
                   <UtensilsCrossed className="w-6 h-6" style={{ color: 'var(--success)' }} />
                 </div>
              </div>
              <div className="text-lg font-display font-medium mb-1" style={{ color: 'var(--text)' }}>Pairing Lab</div>
              <p className="text-sm" style={{ color: 'var(--muted-text)' }}>Find matches for dinner</p>
           </Link>
        </div>
      )}
    </div>
  );
}
