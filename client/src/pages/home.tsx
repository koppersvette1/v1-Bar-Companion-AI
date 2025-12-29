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
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 min-h-[350px] flex items-center justify-center p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 to-slate-950 z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />

        <div className="relative z-10 max-w-md space-y-6">
           <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-300">
             Hybrid Intelligence
           </div>
           
           <h1 className="text-5xl font-serif font-bold text-white leading-tight">
             {inventory.length === 0 ? "Let's build your bar." : "What are we drinking?"}
           </h1>

           <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {inventory.length === 0 ? (
                <>
                  <button onClick={loadSeedData} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                    <FlaskConical className="w-5 h-5" /> Load Demo Data
                  </button>
                  <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <ScanLine className="w-5 h-5" /> Scan First Bottle
                  </button>
                </>
              ) : (
                <>
                  <Link href="/cocktails">
                    <a className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" /> Generate Drink
                    </a>
                  </Link>
                  <Link href="/smoker">
                     <a className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                       <Flame className="w-5 h-5 text-orange-400" /> Smoker Lab
                     </a>
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
           <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-orange-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-slate-700 transition-colors">
                   <FlaskConical className="w-6 h-6 text-slate-300" />
                 </div>
                 <Link href="/inventory">
                   <a className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-white flex items-center gap-1">
                     Manage <ArrowRight className="w-3 h-3" />
                   </a>
                 </Link>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{inventory.length}</div>
              <p className="text-sm text-slate-400">Bottles & tools in stock</p>
           </div>

           {/* Smoker Status */}
           <Link href="/smoker">
             <a className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-orange-500/30 transition-colors group block cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                     <Flame className={cn("w-6 h-6", settings.hasSmoker ? "text-orange-500" : "text-slate-500")} />
                   </div>
                   {settings.hasSmoker && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {settings.hasSmoker ? "Smoker Ready" : "Setup Smoker"}
                </div>
                <p className="text-sm text-slate-400">
                  {settings.hasSmoker ? "Guided sessions active" : "Enable to unlock features"}
                </p>
             </a>
           </Link>

           {/* Pairing */}
           <Link href="/pair">
             <a className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-purple-500/30 transition-colors group block cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                     <UtensilsCrossed className="w-6 h-6 text-purple-400" />
                   </div>
                </div>
                <div className="text-lg font-bold text-white mb-1">Pairing Lab</div>
                <p className="text-sm text-slate-400">Find matches for dinner</p>
             </a>
           </Link>
        </div>
      )}
    </div>
  );
}
