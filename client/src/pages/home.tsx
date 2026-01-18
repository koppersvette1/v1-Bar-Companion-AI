import { Link } from "wouter";
import { ScanLine, FlaskConical, Flame, Sparkles, UtensilsCrossed, Wine, Users, BookOpen } from "lucide-react";
import { useState } from "react";
import AddItemModal from "@/components/add-item-modal";
import { useQuery } from "@tanstack/react-query";
import type { Recipe, UserSettings } from "@shared/schema";
import HeroHeader from "@/components/themed/hero-header";
import SectionPanel from "@/components/themed/section-panel";
import CopperCard from "@/components/themed/copper-card";
import SmokeBackdrop from "@/components/themed/smoke-backdrop";

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
    <SmokeBackdrop variant="medium">
      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />

      <SectionPanel>
        <HeroHeader
          badge="Hybrid Intelligence"
          title={!hasRecipes ? "Let's build your bar." : "What are we drinking?"}
        >
          {!hasRecipes ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[hsl(var(--primary))] text-white font-bold rounded-xl shadow-lg shadow-[hsl(var(--primary))]/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
              data-testid="button-add-first-bottle"
            >
              <ScanLine className="w-5 h-5" /> Add First Bottle
            </button>
          ) : (
            <>
              <Link
                href="/cocktails"
                className="px-8 py-4 bg-[hsl(var(--primary))] text-white font-bold rounded-xl shadow-lg shadow-[hsl(var(--primary))]/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                data-testid="link-generate-drink"
              >
                <Sparkles className="w-5 h-5" /> Browse Drinks
              </Link>
              <Link
                href="/smoker"
                className="px-8 py-4 bg-[hsl(var(--muted))] text-white font-bold rounded-xl hover:bg-[hsl(var(--muted))]/80 transition-colors flex items-center justify-center gap-2"
                data-testid="link-smoker-lab"
              >
                <Flame className="w-5 h-5 text-[hsl(var(--primary))]" /> Smoker Lab
              </Link>
            </>
          )}
        </HeroHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/inventory" data-testid="card-inventory">
            <CopperCard
              icon={FlaskConical}
              iconColor="text-slate-300"
              title="My Bar"
              description="Manage your inventory and tools"
              accentColor="primary"
            />
          </Link>

          <Link href="/smoker" data-testid="card-smoker">
            <CopperCard
              icon={Flame}
              iconColor={settings?.hasSmoker ? "text-[hsl(var(--primary))]" : "text-slate-500"}
              title={settings?.hasSmoker ? "Smoker Ready" : "Setup Smoker"}
              description={settings?.hasSmoker ? "Guided smoking sessions" : "Enable to unlock features"}
              accentColor="primary"
              badge={settings?.hasSmoker ? <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> : undefined}
            />
          </Link>

          <Link href="/pair" data-testid="card-pairing">
            <CopperCard
              icon={UtensilsCrossed}
              iconColor="text-purple-400"
              title="Pairing Lab"
              description="Find drink matches for any meal"
              accentColor="purple"
            />
          </Link>

          <Link href="/people" data-testid="card-people">
            <CopperCard
              icon={Users}
              iconColor="text-blue-400"
              title="People"
              description="Track taste preferences"
              accentColor="blue"
            />
          </Link>

          <Link href="/cocktails" data-testid="card-cocktails">
            <CopperCard
              icon={Wine}
              iconColor="text-green-400"
              title="Cocktails"
              description={`${recipes.length} recipes available`}
              accentColor="green"
            />
          </Link>

          <Link href="/education" data-testid="card-education">
            <CopperCard
              icon={BookOpen}
              iconColor="text-yellow-400"
              title="Education"
              description="Learn smoking techniques"
              accentColor="yellow"
            />
          </Link>
        </div>
      </SectionPanel>
    </SmokeBackdrop>
  );
}
