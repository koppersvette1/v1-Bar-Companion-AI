import { useStore } from "@/lib/store";
import { User, Plus, X, Thermometer, Droplets, Wine, Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';

export default function People() {
  const { people, addPerson, deletePerson } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  
  // New Person Form
  const [name, setName] = useState("");
  const [sweetness, setSweetness] = useState<'dry'|'balanced'|'sweet'>('balanced');
  const [abv, setAbv] = useState<'low'|'medium'|'high'>('medium');

  const handleCreate = () => {
    if(!name) return;
    addPerson({
      name,
      sweetnessPref: sweetness,
      abvComfort: abv,
      likedTags: [],
      dislikedTags: [],
      seasonalPref: 'neutral'
    });
    setName("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-serif font-bold text-white">Profiles</h1>
           <p className="text-slate-400 text-sm">Manage taste preferences for friends & family</p>
         </div>
         <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2">
           <Plus className="w-4 h-4" /> Add Person
         </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-bold text-white">New Profile</h3>
             <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-slate-500" /></button>
           </div>
           
           <div className="space-y-1">
             <label className="text-xs text-slate-400 uppercase font-bold">Name</label>
             <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" placeholder="e.g. Sarah" />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-xs text-slate-400 uppercase font-bold">Sweetness</label>
               <select value={sweetness} onChange={e => setSweetness(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm">
                 <option value="dry">Dry</option>
                 <option value="balanced">Balanced</option>
                 <option value="sweet">Sweet</option>
               </select>
             </div>
             <div className="space-y-1">
               <label className="text-xs text-slate-400 uppercase font-bold">ABV Comfort</label>
               <select value={abv} onChange={e => setAbv(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm">
                 <option value="low">Low (Session)</option>
                 <option value="medium">Medium</option>
                 <option value="high">High (Boozy)</option>
               </select>
             </div>
           </div>

           <button onClick={handleCreate} className="w-full py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700">Create Profile</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {people.length === 0 && !showAdd && (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
             <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
             <p>No profiles yet. Add one to personalize recommendations.</p>
           </div>
        )}

        {people.map(p => (
          <div key={p.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative group">
             <button onClick={() => deletePerson(p.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
               <Trash2 className="w-4 h-4" />
             </button>
             
             <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white font-serif">
                 {p.name[0]}
               </div>
               <div>
                 <h3 className="font-bold text-white text-lg">{p.name}</h3>
                 <div className="flex gap-2 text-xs text-slate-400">
                   <span className="capitalize">{p.sweetnessPref}</span>
                   <span>•</span>
                   <span className="capitalize">{p.abvComfort} ABV</span>
                 </div>
               </div>
             </div>

             <div className="flex flex-wrap gap-2">
               {p.likedTags.map(t => (
                 <span key={t} className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] rounded uppercase font-bold">{t}</span>
               ))}
               {p.dislikedTags.map(t => (
                 <span key={t} className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] rounded uppercase font-bold line-through">{t}</span>
               ))}
               {p.likedTags.length === 0 && p.dislikedTags.length === 0 && (
                 <span className="text-xs text-slate-600 italic">No taste data yet...</span>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
