import { Link } from "wouter";
import { ScanLine, FlaskConical, Flame, Sparkles, UtensilsCrossed, ArrowRight, Wine, Users, BookOpen } from "lucide-react";
import { useState } from "react";
import AddItemModal from "@/components/add-item-modal";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import type { Recipe, UserSettings } from "@shared/schema";

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const hasRecipes = recipes.length > 0;

  return (
    <div className="space-y-8 pb-24">
      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />

      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 min-h-[350px] flex items-center justify-center p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 to-slate-950 z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />

        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-300">
            Hybrid Intelligence
          </div>
           
          <h1 className="text-5xl font-serif font-bold text-white leading-tight">
            {!hasRecipes ? "Let's build your bar." : "What are we drinking?"}
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {!hasRecipes ? (
              <>
                <button 
                  onClick={() => setShowAddModal(true)} 
                  className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  data-testid="button-add-first-bottle"
                >
                  <ScanLine className="w-5 h-5" /> Add First Bottle
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/cocktails"
                  className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  data-testid="link-generate-drink"
                >
                  <Sparkles className="w-5 h-5" /> Browse Drinks
                </Link>
                <Link 
                  href="/smoker"
                  className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  data-testid="link-smoker-lab"
                >
                  <Flame className="w-5 h-5 text-orange-400" /> Smoker Lab
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link 
          href="/inventory"
          className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-orange-500/30 transition-colors group block"
          data-testid="card-inventory"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-slate-700 transition-colors">
              <FlaskConical className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-white flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-lg font-bold text-white mb-1">My Bar</div>
          <p className="text-sm text-slate-400">Manage your inventory and tools</p>
        </Link>

        <Link 
          href="/smoker"
          className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-orange-500/30 transition-colors group block"
          data-testid="card-smoker"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-orange-500/20 transition-colors">
              <Flame className={cn("w-6 h-6", settings?.hasSmoker ? "text-orange-500" : "text-slate-500")} />
            </div>
            {settings?.hasSmoker && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          </div>
          <div className="text-lg font-bold text-white mb-1">
            {settings?.hasSmoker ? "Smoker Ready" : "Setup Smoker"}
          </div>
          <p className="text-sm text-slate-400">
            {settings?.hasSmoker ? "Guided smoking sessions" : "Enable to unlock features"}
          </p>
        </Link>

        <Link 
          href="/pair"
          className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-purple-500/30 transition-colors group block"
          data-testid="card-pairing"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-purple-500/20 transition-colors">
              <UtensilsCrossed className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-lg font-bold text-white mb-1">Pairing Lab</div>
          <p className="text-sm text-slate-400">Find drink matches for any meal</p>
        </Link>

        <Link 
          href="/people"
          className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-colors group block"
          data-testid="card-people"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-blue-500/20 transition-colors">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-lg font-bold text-white mb-1">People</div>
          <p className="text-sm text-slate-400">Track taste preferences</p>
        </Link>

        <Link 
          href="/cocktails"
          className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-green-500/30 transition-colors group block"
          data-testid="card-cocktails"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-green-500/20 transition-colors">
              <Wine className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="text-lg font-bold text-white mb-1">Cocktails</div>
          <p className="text-sm text-slate-400">{recipes.length} recipes available</p>
        </Link>

        <Link 
          href="/education"
          className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-yellow-500/30 transition-colors group block"
          data-testid="card-education"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
              <BookOpen className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="text-lg font-bold text-white mb-1">Education</div>
          <p className="text-sm text-slate-400">Learn smoking techniques</p>
        </Link>
      </div>
    </div>
  );
}
