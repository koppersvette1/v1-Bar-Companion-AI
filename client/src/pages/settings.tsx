import { useStore, Wood, Intensity, SmokerDeviceType } from "@/lib/store";
import { DollarSign, Calculator, Trash2, Flame, ChevronDown, ChevronUp, Plus, Check, X, Edit2, Wind, Leaf, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useState } from "react";

const SMOKER_DEVICE_OPTIONS: { value: SmokerDeviceType; label: string; description: string }[] = [
  { value: 'chimney', label: 'Chimney / Top-Mounted', description: 'Aged & Charred style smoker' },
  { value: 'cloche', label: 'Cloché / Dome', description: 'Trap smoke under glass dome' },
  { value: 'smoking-gun', label: 'Smoking Gun', description: 'Handheld smoke infuser' },
  { value: 'torch-only', label: 'Torch Only', description: 'Chips + torch method' },
];

const INTENSITY_OPTIONS: Intensity[] = ['light', 'medium', 'bold', 'very-strong'];

function WoodEditor({ wood, onSave, onCancel }: { wood?: Partial<Wood>; onSave: (wood: Omit<Wood, 'id' | 'isCustom'>) => void; onCancel: () => void }) {
  const [name, setName] = useState(wood?.name || '');
  const [intensity, setIntensity] = useState<Intensity>(wood?.intensity || 'medium');
  const [timeMin, setTimeMin] = useState(wood?.timeMin?.toString() || '8');
  const [timeMax, setTimeMax] = useState(wood?.timeMax?.toString() || '12');
  const [purpose, setPurpose] = useState(wood?.purpose || '');
  const [tastingNotes, setTastingNotes] = useState(wood?.tastingNotes || '');
  const [flavorTags, setFlavorTags] = useState(wood?.flavorTags?.join(', ') || '');
  const [bestWithDrinkTags, setBestWithDrinkTags] = useState(wood?.bestWithDrinkTags?.join(', ') || '');
  const [bestWithFoodTags, setBestWithFoodTags] = useState(wood?.bestWithFoodTags?.join(', ') || '');
  const [avoidWithDrinkTags, setAvoidWithDrinkTags] = useState(wood?.avoidWithDrinkTags?.join(', ') || '');
  const [beginnerSafe, setBeginnerSafe] = useState(wood?.beginnerSafe ?? true);
  const [isGarnishOnly, setIsGarnishOnly] = useState(wood?.methodRestriction === 'garnishOnly');

  const handleSubmit = () => {
    if (!name) return;
    onSave({
      name,
      intensity,
      timeMin: parseInt(timeMin) || 8,
      timeMax: parseInt(timeMax) || 12,
      purpose,
      tastingNotes,
      flavorTags: flavorTags.split(',').map(t => t.trim()).filter(Boolean),
      bestWithDrinkTags: bestWithDrinkTags.split(',').map(t => t.trim()).filter(Boolean),
      bestWithFoodTags: bestWithFoodTags.split(',').map(t => t.trim()).filter(Boolean),
      avoidWithDrinkTags: avoidWithDrinkTags.split(',').map(t => t.trim()).filter(Boolean),
      beginnerSafe,
      isInMyKit: wood?.isInMyKit ?? true,
      methodRestriction: isGarnishOnly ? 'garnishOnly' : undefined,
    });
  };

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 animate-in fade-in">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">Name</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white mt-1"
            placeholder="e.g. Cherry"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">Intensity</label>
          <select 
            value={intensity} 
            onChange={e => setIntensity(e.target.value as Intensity)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white mt-1"
          >
            {INTENSITY_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">Time Min (sec)</label>
          <input 
            type="number" 
            value={timeMin} 
            onChange={e => setTimeMin(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">Time Max (sec)</label>
          <input 
            type="number" 
            value={timeMax} 
            onChange={e => setTimeMax(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white mt-1"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase font-bold">Purpose</label>
        <input 
          value={purpose} 
          onChange={e => setPurpose(e.target.value)} 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white mt-1"
          placeholder="e.g. Sweet richness"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase font-bold">Tasting Notes</label>
        <input 
          value={tastingNotes} 
          onChange={e => setTastingNotes(e.target.value)} 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white mt-1"
          placeholder="e.g. Sweet, fruity, rounded"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase font-bold">Flavor Tags (comma-separated)</label>
        <input 
          value={flavorTags} 
          onChange={e => setFlavorTags(e.target.value)} 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white mt-1"
          placeholder="e.g. fruity, rich, sweet"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase font-bold">Best with Drinks (comma-separated)</label>
        <input 
          value={bestWithDrinkTags} 
          onChange={e => setBestWithDrinkTags(e.target.value)} 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white mt-1"
          placeholder="e.g. old-fashioned, manhattan, bourbon"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase font-bold">Best with Foods (comma-separated)</label>
        <input 
          value={bestWithFoodTags} 
          onChange={e => setBestWithFoodTags(e.target.value)} 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white mt-1"
          placeholder="e.g. pork, duck, chocolate"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase font-bold">Avoid with Drinks (comma-separated)</label>
        <input 
          value={avoidWithDrinkTags} 
          onChange={e => setAvoidWithDrinkTags(e.target.value)} 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white mt-1"
          placeholder="e.g. light, fruity"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={beginnerSafe} 
            onChange={e => setBeginnerSafe(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-slate-300">Beginner Safe</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isGarnishOnly} 
            onChange={e => setIsGarnishOnly(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-slate-300">Garnish Only</span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button 
          onClick={onCancel}
          className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold hover:bg-slate-700"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!name}
          className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { userSettings, updateSettings, reset, woodLibrary, toggleWoodKit, updateWood, addWood, deleteWood, garnishLibrary, toggleGarnishKit, addGarnish, deleteGarnish } = useStore();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [woodLibraryExpanded, setWoodLibraryExpanded] = useState(false);
  const [garnishLibraryExpanded, setGarnishLibraryExpanded] = useState(false);
  const [showAddWood, setShowAddWood] = useState(false);
  const [editingWoodId, setEditingWoodId] = useState<string | null>(null);

  const handleReset = () => {
    if (confirm("Reset everything?")) {
      reset();
      window.location.reload();
    }
  };

  const handleAddWood = (wood: Omit<Wood, 'id' | 'isCustom'>) => {
    addWood(wood);
    setShowAddWood(false);
    toast({ title: "Wood added", description: `${wood.name} has been added to your library.` });
  };

  const handleUpdateWood = (id: string, wood: Omit<Wood, 'id' | 'isCustom'>) => {
    updateWood(id, wood);
    setEditingWoodId(null);
    toast({ title: "Wood updated", description: `${wood.name} has been updated.` });
  };

  const handleDeleteWood = (wood: Wood) => {
    if (wood.isCustom && confirm(`Delete ${wood.name}?`)) {
      deleteWood(wood.id);
      toast({ title: "Wood deleted", description: `${wood.name} has been removed.` });
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm">App configuration</p>
      </div>

      <div className="space-y-6">

        {/* Theme Selection */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <Palette className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Theme</h3>
              <p className="text-sm text-slate-400 mt-1">
                Choose your visual style
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('classic')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                theme === 'classic'
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              )}
            >
              <div className="font-bold text-white mb-1">Classic</div>
              <div className="text-xs text-slate-400">Gold & midnight blue</div>
            </button>

            <button
              onClick={() => setTheme('smoker-lab')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                theme === 'smoker-lab'
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              )}
            >
              <div className="font-bold text-white mb-1">Smoker Lab</div>
              <div className="text-xs text-slate-400">Warm smoke & embers</div>
            </button>
          </div>
        </div>

        {/* Cost Tracking */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
           <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="flex-1">
                 <h3 className="text-lg font-bold text-white">Drink Cost Tracking</h3>
                 <p className="text-sm text-slate-400 mt-1">
                   Estimate cost per drink and batch using your bottle prices. Data is stored locally.
                 </p>
              </div>
              <button 
                onClick={() => updateSettings({ enableCostTracking: !userSettings.enableCostTracking })}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors flex-shrink-0 mt-1",
                  userSettings.enableCostTracking ? "bg-green-500" : "bg-slate-700"
                )}
                data-testid="toggle-cost-tracking"
              >
                <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", userSettings.enableCostTracking ? "translate-x-6" : "translate-x-0")} />
              </button>
           </div>
           
           {userSettings.enableCostTracking && (
             <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3 text-xs text-green-400 flex gap-2">
               <Calculator className="w-4 h-4" />
               Prices will now appear in inventory and recipe breakdowns.
             </div>
           )}
        </div>

        {/* Smoker */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white">Smoker Owner</h3>
                   <p className="text-sm text-slate-400">Unlock wood profiles and timers</p>
                </div>
              </div>
               <button 
                onClick={() => updateSettings({ hasSmoker: !userSettings.hasSmoker })}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors flex-shrink-0",
                  userSettings.hasSmoker ? "bg-orange-500" : "bg-slate-700"
                )}
                data-testid="toggle-smoker"
              >
                <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", userSettings.hasSmoker ? "translate-x-6" : "translate-x-0")} />
              </button>
           </div>

           {/* Smoker Device Type */}
           {userSettings.hasSmoker && (
             <div className="border-t border-slate-800 pt-4 mt-4">
               <h4 className="text-sm font-bold text-white mb-3">Smoker Device Type</h4>
               <div className="grid grid-cols-2 gap-2">
                 {SMOKER_DEVICE_OPTIONS.map(option => (
                   <button
                     key={option.value}
                     onClick={() => updateSettings({ smokerType: option.value })}
                     className={cn(
                       "p-3 rounded-xl border text-left transition-all",
                       userSettings.smokerType === option.value
                         ? "bg-orange-500/10 border-orange-500 text-orange-400"
                         : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600"
                     )}
                     data-testid={`device-${option.value}`}
                   >
                     <p className="font-medium text-sm">{option.label}</p>
                     <p className="text-[10px] text-slate-500 mt-0.5">{option.description}</p>
                   </button>
                 ))}
               </div>
             </div>
           )}

           {/* Wood Library (Collapsible) */}
           {userSettings.hasSmoker && (
             <div className="border-t border-slate-800 pt-4 mt-4">
               <button 
                 onClick={() => setWoodLibraryExpanded(!woodLibraryExpanded)}
                 className="flex items-center justify-between w-full text-left"
                 data-testid="button-expand-wood-library"
               >
                 <div className="flex items-center gap-2">
                   <Wind className="w-4 h-4 text-orange-500" />
                   <span className="font-bold text-white">Wood Library</span>
                   <span className="text-xs text-slate-500">({woodLibrary.length} woods)</span>
                 </div>
                 {woodLibraryExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
               </button>

               {woodLibraryExpanded && (
                 <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                   {/* Add Custom Wood Button */}
                   {!showAddWood ? (
                     <button 
                       onClick={() => setShowAddWood(true)}
                       className="w-full py-2 border border-dashed border-slate-700 text-slate-400 rounded-xl hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
                       data-testid="button-add-custom-wood"
                     >
                       <Plus className="w-4 h-4" /> Add Custom Wood
                     </button>
                   ) : (
                     <WoodEditor 
                       onSave={handleAddWood}
                       onCancel={() => setShowAddWood(false)}
                     />
                   )}

                   {/* Wood List */}
                   {woodLibrary.map(wood => (
                     <div key={wood.id}>
                       {editingWoodId === wood.id ? (
                         <WoodEditor 
                           wood={wood}
                           onSave={(updates) => handleUpdateWood(wood.id, updates)}
                           onCancel={() => setEditingWoodId(null)}
                         />
                       ) : (
                         <div 
                           className={cn(
                             "p-4 rounded-xl border transition-all",
                             wood.isInMyKit 
                               ? "bg-slate-800/50 border-slate-700" 
                               : "bg-slate-900/50 border-slate-800 opacity-60"
                           )}
                           data-testid={`wood-item-${wood.id}`}
                         >
                           <div className="flex items-start justify-between gap-3">
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 flex-wrap">
                                 <h4 className="font-bold text-white">{wood.name}</h4>
                                 <span className={cn(
                                   "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                                   wood.intensity === 'light' ? "bg-green-500/20 text-green-400" :
                                   wood.intensity === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                                   wood.intensity === 'bold' ? "bg-orange-500/20 text-orange-400" :
                                   "bg-red-500/20 text-red-400"
                                 )}>
                                   {wood.intensity}
                                 </span>
                                 {wood.methodRestriction === 'garnishOnly' && (
                                   <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                     Garnish Only
                                   </span>
                                 )}
                                 {wood.isCustom && (
                                   <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                     Custom
                                   </span>
                                 )}
                               </div>
                               <p className="text-xs text-slate-400 mt-1">{wood.tastingNotes}</p>
                               <p className="text-[10px] text-slate-500 mt-1">{wood.timeMin}-{wood.timeMax}s</p>
                             </div>

                             <div className="flex items-center gap-2 flex-shrink-0">
                               <button 
                                 onClick={() => setEditingWoodId(wood.id)}
                                 className="p-1.5 text-slate-500 hover:text-white transition-colors"
                                 data-testid={`button-edit-${wood.id}`}
                               >
                                 <Edit2 className="w-3.5 h-3.5" />
                               </button>
                               
                               {wood.isCustom && (
                                 <button 
                                   onClick={() => handleDeleteWood(wood)}
                                   className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                                   data-testid={`button-delete-${wood.id}`}
                                 >
                                   <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                               )}
                               
                               <button 
                                 onClick={() => toggleWoodKit(wood.id)}
                                 className={cn(
                                   "p-1.5 rounded-full transition-colors",
                                   wood.isInMyKit 
                                     ? "bg-orange-500 text-white" 
                                     : "bg-slate-700 text-slate-400"
                                 )}
                                 data-testid={`button-toggle-kit-${wood.id}`}
                               >
                                 <Check className="w-3.5 h-3.5" />
                               </button>
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}
        </div>

        {/* Garnish Library */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Garnish Library</h3>
              <p className="text-sm text-slate-400">Citrus, herbs, spices & rims</p>
            </div>
          </div>

          <button 
            onClick={() => setGarnishLibraryExpanded(!garnishLibraryExpanded)}
            className="flex items-center justify-between w-full text-left border-t border-slate-800 pt-4 mt-4"
            data-testid="button-expand-garnish-library"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Manage Garnishes</span>
              <span className="text-xs text-slate-500">({garnishLibrary.length} items)</span>
            </div>
            {garnishLibraryExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {garnishLibraryExpanded && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              {['citrus', 'herb', 'spice', 'fruit', 'savory', 'rim'].map(category => {
                const categoryGarnishes = garnishLibrary.filter(g => g.category === category);
                if (categoryGarnishes.length === 0) return null;
                return (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide pt-2">
                      {category === 'rim' ? 'Rims' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </h4>
                    {categoryGarnishes.map(garnish => (
                      <div 
                        key={garnish.id}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex items-center justify-between",
                          garnish.isInMyKit 
                            ? "bg-slate-800/50 border-slate-700" 
                            : "bg-slate-900/50 border-slate-800 opacity-60"
                        )}
                        data-testid={`garnish-item-${garnish.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-medium text-white text-sm">{garnish.name}</h5>
                            {garnish.smokeFriendly && (
                              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">
                                SMOKE OK
                              </span>
                            )}
                            {garnish.isCustom && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">
                                CUSTOM
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {garnish.flavorTags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] text-slate-500">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {garnish.isCustom && (
                            <button 
                              onClick={() => {
                                if (confirm(`Delete ${garnish.name}?`)) {
                                  deleteGarnish(garnish.id);
                                  toast({ title: "Garnish deleted" });
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                              data-testid={`button-delete-garnish-${garnish.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => toggleGarnishKit(garnish.id)}
                            className={cn(
                              "p-1.5 rounded-full transition-colors",
                              garnish.isInMyKit 
                                ? "bg-green-500 text-white" 
                                : "bg-slate-700 text-slate-400"
                            )}
                            data-testid={`button-toggle-garnish-${garnish.id}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="pt-8 border-t border-slate-800">
           <button onClick={handleReset} className="w-full py-3 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/10 flex items-center justify-center gap-2" data-testid="button-reset">
             <Trash2 className="w-4 h-4" /> Reset Application Data
           </button>
        </div>

      </div>
    </div>
  );
}
