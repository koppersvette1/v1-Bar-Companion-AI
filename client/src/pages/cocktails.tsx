import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePeople, useFavorites, useToggleFavorite, useSettings, useUpdateSettings } from "@/lib/api";
import { Wind, Heart, User, Bug, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { rankRecipesForPerson } from "@/lib/logic/learning";
import { validateRecipe } from "@/lib/logic/rules";
import DebugPanel from "@/components/debug-panel";
import SmokeBackdrop from "@/components/themed/smoke-backdrop";
import SectionPanel from "@/components/themed/section-panel";

export default function Cocktails() {
  const { data: recipes = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/recipes"],
  });
  const { data: people = [] } = usePeople();
  const { data: favoriteIds = [], isLoading: favoritesLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all'|'smoky'|'classic'>('all');

  const selectedPerson = people.find((p: any) => p.id === selectedPersonId) || null;
  
  // 1. Filter
  let displayRecipes = recipes.filter(r => {
    if (filter === 'smoky' && !r.isSmoked) return false;
    if (filter === 'classic' && r.style !== 'classic') return false;
    return true;
  });

  // 2. Rank (Learning)
  displayRecipes = rankRecipesForPerson(displayRecipes, selectedPerson);

  const handleToggleFavorite = (recipeId: string) => {
    const isFavorite = favoriteIds.includes(recipeId);
    toggleFavorite.mutate({ recipeId, isFavorite });
  };

  const handleToggleDebug = () => {
    if (settings) {
      updateSettings.mutate({ debugMode: !settings.debugMode });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[hsl(var(--primary))] animate-spin" />
      </div>
    );
  }

  return (
    <SmokeBackdrop variant="subtle">
      <SectionPanel>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[hsl(var(--foreground))]" data-testid="text-page-title">Cocktails</h1>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">Library & Generator</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleToggleDebug}
              className={cn("p-2 rounded-xl border transition-colors", settings?.debugMode ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border-[hsl(var(--primary))]" : "bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]")}
              data-testid="button-toggle-debug"
            >
              <Bug className="w-4 h-4" />
            </button>

            {people.length > 0 && (
              <div className="flex items-center gap-2 bg-[hsl(var(--card))] p-1 rounded-xl border border-[hsl(var(--border))]">
                <span className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))] px-2">For:</span>
                <select
                  className="bg-transparent text-[hsl(var(--foreground))] text-sm font-bold focus:outline-none"
                  onChange={(e) => setSelectedPersonId(e.target.value || null)}
                  data-testid="select-person"
                >
                  <option value="">Everyone</option>
                  {people.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <User className="w-4 h-4 text-[hsl(var(--primary))]" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'classic', 'smoky'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors",
                filter === f ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))]" : "bg-transparent text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]"
              )}
              data-testid={`button-filter-${f}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRecipes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[hsl(var(--muted-foreground))]">
              <p>No recipes found matching your filters.</p>
            </div>
          ) : (
            displayRecipes.map(recipe => {
              const warnings = validateRecipe(recipe);
              const isFav = favoriteIds.includes(recipe.id);

              return (
                <div key={recipe.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl overflow-hidden group hover:border-[hsl(var(--primary))]/30 transition-colors" data-testid={`card-recipe-${recipe.id}`}>
                  <div className="aspect-video relative">
                    <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={recipe.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase bg-[hsl(var(--foreground))]/10 backdrop-blur-md px-2 py-1 rounded text-[hsl(var(--foreground))]">{recipe.baseSpirit}</span>
                        {recipe.isSmoked && <span className="text-[10px] font-bold uppercase bg-[hsl(var(--primary))]/80 backdrop-blur-md px-2 py-1 rounded text-[hsl(var(--foreground))] flex items-center gap-1"><Wind className="w-3 h-3" /> Smoked</span>}
                        {selectedPerson && (recipe as any)._score && (recipe as any)._score > 0 && (
                          <span className="text-[10px] font-bold uppercase bg-green-500/20 text-green-400 px-2 py-1 rounded flex items-center gap-1" data-testid={`badge-match-${recipe.id}`}>
                            {(recipe as any)._score}% Match
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-[hsl(var(--foreground))]" data-testid={`text-name-${recipe.id}`}>{recipe.name}</h3>
                    </div>

                    <button
                      onClick={() => handleToggleFavorite(recipe.id)}
                      className={cn("absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-colors", isFav ? "bg-red-500 text-[hsl(var(--foreground))]" : "bg-black/30 text-[hsl(var(--foreground))] hover:bg-black/50")}
                      disabled={favoritesLoading || toggleFavorite.isPending}
                      data-testid={`button-favorite-${recipe.id}`}
                    >
                      <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">{recipe.description}</p>

                    <div className="space-y-1">
                      {recipe.ingredients.slice(0,3).map((ing: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-[hsl(var(--foreground))]/90">{ing.name}</span>
                          <span className="text-[hsl(var(--muted-foreground))]">{ing.amount}</span>
                        </div>
                      ))}
                    </div>

                    {warnings.length > 0 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-2 items-start">
                        <div className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5">ⓘ</div>
                        <p className="text-xs text-yellow-200/80">{warnings[0]}</p>
                      </div>
                    )}

                    {settings?.debugMode && selectedPerson && (
                      <DebugPanel recipe={recipe} />
                    )}

                    <button className="w-full py-3 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--foreground))] text-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] font-bold rounded-xl transition-colors flex items-center justify-center gap-2" data-testid={`button-view-${recipe.id}`}>
                      View Recipe
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionPanel>
    </SmokeBackdrop>
  );
}
