import { useState } from "react";
import { useStore } from "@/lib/store";
import { usePeople, useFavorites, useToggleFavorite, useSettings, useUpdateSettings } from "@/lib/api";
import { Wind, Heart, User, Bug } from "lucide-react";
import { cn } from "@/lib/utils";
import { rankRecipesForPerson } from "@/lib/logic/learning";
import { validateRecipe } from "@/lib/logic/rules";
import DebugPanel from "@/components/debug-panel";

export default function Cocktails() {
  const { recipes } = useStore();
  const { data: people = [] } = usePeople();
  const { data: favoriteIds = [], isLoading: favoritesLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all'|'smoky'|'classic'>('all');

  const selectedPerson = people.find((p: any) => p.id === selectedPersonId) || null;
  
  let displayRecipes = recipes.filter(r => {
    if (filter === 'smoky' && !r.isSmoked) return false;
    if (filter === 'classic' && r.style !== 'classic') return false;
    return true;
  });

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

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
           <h1 className="text-3xl font-display font-semibold tracking-wide" style={{ color: 'var(--text)' }} data-testid="text-page-title">
             Cocktails
           </h1>
           <p className="text-sm mt-1" style={{ color: 'var(--muted-text)' }}>Library & Generator</p>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={handleToggleDebug}
             className={cn("p-2 rounded-xl transition-colors", settings?.debugMode ? "brass-border" : "")}
             style={{ 
               background: settings?.debugMode ? 'rgba(198, 161, 91, 0.15)' : 'var(--surface2)',
               color: settings?.debugMode ? 'var(--accent)' : 'var(--muted-text)',
               border: settings?.debugMode ? '1px solid var(--accent)' : '1px solid var(--border-color)'
             }}
             data-testid="button-toggle-debug"
           >
             <Bug className="w-4 h-4" />
           </button>

           {people.length > 0 && (
            <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'var(--surface2)', border: '1px solid var(--border-color)' }}>
               <span className="text-xs font-semibold uppercase tracking-wider px-2" style={{ color: 'var(--muted-text)' }}>For:</span>
               <select 
                 className="bg-transparent text-sm font-semibold focus:outline-none"
                 style={{ color: 'var(--text)' }}
                 onChange={(e) => setSelectedPersonId(e.target.value || null)}
                 data-testid="select-person"
               >
                 <option value="">Everyone</option>
                 {people.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
               <User className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
         {['all', 'classic', 'smoky'].map(f => (
           <button 
             key={f}
             onClick={() => setFilter(f as any)}
             className={cn("chip-speakeasy px-4 py-2", filter === f && "active")}
             data-testid={`button-filter-${f}`}
           >
             {f}
           </button>
         ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {displayRecipes.map(recipe => {
           const warnings = validateRecipe(recipe);
           const isFav = favoriteIds.includes(recipe.id);

           return (
             <div key={recipe.id} className="card-speakeasy overflow-hidden group hover:border-[var(--accent)]/30 transition-colors" data-testid={`card-recipe-${recipe.id}`}>
                <div className="aspect-video relative">
                   <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" alt={recipe.name} />
                   <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--surface) 0%, transparent 100%)' }} />
                   
                   <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: 'var(--text)' }}>{recipe.baseSpirit}</span>
                        {recipe.isSmoked && (
                          <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded flex items-center gap-1" style={{ background: 'rgba(198, 161, 91, 0.8)', color: 'var(--bg)' }}>
                            <Wind className="w-3 h-3" /> Smoked
                          </span>
                        )}
                        {selectedPerson && recipe._score && recipe._score > 0 && (
                          <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded flex items-center gap-1" style={{ background: 'rgba(31, 107, 74, 0.8)', color: 'var(--text)' }} data-testid={`badge-match-${recipe.id}`}>
                             {recipe._score}% Match
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-display font-semibold tracking-wide" style={{ color: 'var(--text)' }} data-testid={`text-name-${recipe.id}`}>{recipe.name}</h3>
                   </div>

                   <button 
                     onClick={() => handleToggleFavorite(recipe.id)}
                     className={cn("absolute top-4 right-4 p-2 rounded-full transition-colors")}
                     style={{ 
                       background: isFav ? 'var(--danger)' : 'rgba(0,0,0,0.4)',
                       backdropFilter: 'blur(8px)',
                       color: 'var(--text)'
                     }}
                     disabled={favoritesLoading || toggleFavorite.isPending}
                     data-testid={`button-favorite-${recipe.id}`}
                   >
                     <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
                   </button>
                </div>

                <div className="p-6 space-y-4">
                   <p className="text-sm line-clamp-2" style={{ color: 'var(--muted-text)' }}>{recipe.description}</p>
                   
                   <div className="space-y-1">
                     {recipe.ingredients.slice(0,3).map((ing, i) => (
                       <div key={i} className="flex justify-between text-sm">
                         <span style={{ color: 'var(--text)' }}>{ing.name}</span>
                         <span style={{ color: 'var(--muted-text)' }}>{ing.amount}</span>
                       </div>
                     ))}
                   </div>

                   {warnings.length > 0 && (
                     <div className="p-3 rounded-lg flex gap-2 items-start" style={{ background: 'rgba(139, 44, 44, 0.15)', border: '1px solid rgba(139, 44, 44, 0.3)' }}>
                       <span style={{ color: 'var(--accent)' }}>⚠</span>
                       <p className="text-xs" style={{ color: 'var(--text)' }}>{warnings[0]}</p>
                     </div>
                   )}
                   
                   {settings?.debugMode && selectedPerson && (
                     <DebugPanel recipe={recipe} />
                   )}

                   <button 
                     className="w-full py-3 rounded-xl font-semibold transition-colors"
                     style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-color)' }}
                     data-testid={`button-view-${recipe.id}`}
                   >
                     View Recipe
                   </button>
                </div>
             </div>
           );
         })}
      </div>
    </div>
  );
}
