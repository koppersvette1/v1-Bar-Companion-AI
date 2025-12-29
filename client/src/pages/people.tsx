import { usePeople, useCreatePerson, useDeletePerson } from "@/lib/api";
import { User, Plus, X, Trash2, Zap } from "lucide-react";
import { useState } from "react";

const TEMPLATES = [
  {
    name: "Wine Lover",
    desc: "Dry, crisp, lower ABV",
    data: { sweetnessPref: 'dry', abvComfort: 'low', seasonalPref: 'warm-weather', likedTags: ['refreshing', 'citrus', 'sour'], dislikedTags: ['sweet', 'boozy'] }
  },
  {
    name: "Cocktail Geek",
    desc: "Bitter, strong, complex",
    data: { sweetnessPref: 'balanced', abvComfort: 'high', seasonalPref: 'neutral', likedTags: ['bitter', 'herbal', 'boozy', 'complex'], dislikedTags: ['sweet', 'fruity'] }
  },
  {
    name: "Sweet Tooth",
    desc: "Fruity, dessert drinks",
    data: { sweetnessPref: 'sweet', abvComfort: 'medium', seasonalPref: 'neutral', likedTags: ['sweet', 'fruity', 'dessert'], dislikedTags: ['bitter', 'dry', 'herbal'] }
  }
];

export default function People() {
  const { data: people = [], isLoading } = usePeople();
  const createPerson = useCreatePerson();
  const deletePerson = useDeletePerson();
  
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [sweetness, setSweetness] = useState<'dry'|'balanced'|'sweet'>('balanced');
  const [abv, setAbv] = useState<'low'|'medium'|'high'>('medium');
  const [likedTags, setLikedTags] = useState<string[]>([]);

  const handleCreate = () => {
    if(!name) return;
    createPerson.mutate({
      name,
      sweetnessPref: sweetness,
      abvComfort: abv,
      likedTags: likedTags,
      dislikedTags: [],
      seasonalPref: 'neutral'
    });
    setName("");
    setLikedTags([]);
    setShowAdd(false);
  };

  const applyTemplate = (tpl: any) => {
    setSweetness(tpl.data.sweetnessPref);
    setAbv(tpl.data.abvComfort);
    setLikedTags(tpl.data.likedTags);
    if (!name) setName(tpl.name.split(' ')[0]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div style={{ color: 'var(--muted-text)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-display font-semibold tracking-wide" style={{ color: 'var(--text)' }} data-testid="text-page-title">
             Profiles
           </h1>
           <p className="text-sm mt-1" style={{ color: 'var(--muted-text)' }}>Manage taste preferences for friends & family</p>
         </div>
         <button 
           onClick={() => setShowAdd(true)} 
           className="btn-brass px-4 py-2 rounded-lg text-sm flex items-center gap-2"
           data-testid="button-add-person"
         >
           <Plus className="w-4 h-4" /> Add Person
         </button>
      </div>

      {showAdd && (
        <div className="card-speakeasy p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-display font-medium tracking-wide" style={{ color: 'var(--text)' }}>New Profile</h3>
             <button onClick={() => setShowAdd(false)} data-testid="button-close-form">
               <X className="w-4 h-4" style={{ color: 'var(--muted-text)' }} />
             </button>
           </div>

           {/* Quick Templates */}
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
             {TEMPLATES.map(t => (
               <button 
                 key={t.name}
                 onClick={() => applyTemplate(t)}
                 className="flex-shrink-0 px-3 py-2 rounded-xl text-left transition-colors group"
                 style={{ background: 'var(--surface2)', border: '1px solid var(--border-color)' }}
                 data-testid={`button-template-${t.name.toLowerCase().replace(/\s/g, '-')}`}
               >
                 <div className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                   <Zap className="w-3 h-3" /> {t.name}
                 </div>
                 <div className="text-[10px]" style={{ color: 'var(--muted-text)' }}>{t.desc}</div>
               </button>
             ))}
           </div>
           
           <div className="space-y-1">
             <label className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--muted-text)' }}>Name</label>
             <input 
               value={name} 
               onChange={e => setName(e.target.value)} 
               className="input-speakeasy w-full rounded-lg p-3"
               placeholder="e.g. Sarah"
               data-testid="input-person-name"
             />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--muted-text)' }}>Sweetness</label>
               <select 
                 value={sweetness} 
                 onChange={e => setSweetness(e.target.value as any)} 
                 className="input-speakeasy w-full rounded-lg p-3 text-sm"
                 data-testid="select-sweetness"
               >
                 <option value="dry">Dry</option>
                 <option value="balanced">Balanced</option>
                 <option value="sweet">Sweet</option>
               </select>
             </div>
             <div className="space-y-1">
               <label className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--muted-text)' }}>ABV Comfort</label>
               <select 
                 value={abv} 
                 onChange={e => setAbv(e.target.value as any)} 
                 className="input-speakeasy w-full rounded-lg p-3 text-sm"
                 data-testid="select-abv"
               >
                 <option value="low">Low (Session)</option>
                 <option value="medium">Medium</option>
                 <option value="high">High (Boozy)</option>
               </select>
             </div>
           </div>

           {likedTags.length > 0 && (
             <div className="flex flex-wrap gap-2 pt-2">
               {likedTags.map(t => (
                 <span key={t} className="chip-speakeasy active">{t}</span>
               ))}
             </div>
           )}

           <button 
             onClick={handleCreate} 
             className="w-full py-3 rounded-lg font-semibold transition-colors"
             style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-color)' }}
             data-testid="button-create-person"
           >
             Create Profile
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {people.length === 0 && !showAdd && (
          <div className="col-span-full py-12 text-center rounded-2xl" style={{ border: '1px dashed var(--border-color)' }}>
             <User className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: 'var(--muted-text)' }} />
             <p style={{ color: 'var(--muted-text)' }}>No profiles yet. Add one to personalize recommendations.</p>
           </div>
        )}

        {people.map((p: any) => (
          <div key={p.id} className="card-speakeasy p-6 relative group" data-testid={`card-person-${p.id}`}>
             <button 
               onClick={() => deletePerson.mutate(p.id)} 
               className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ color: 'var(--muted-text)' }}
               data-testid={`button-delete-${p.id}`}
             >
               <Trash2 className="w-4 h-4 hover:text-[var(--danger)]" />
             </button>
             
             <div className="flex items-center gap-3 mb-4">
               <div 
                 className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-display font-semibold"
                 style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #A8884A 100%)', color: 'var(--bg)' }}
               >
                 {p.name[0]}
               </div>
               <div>
                 <h3 className="font-display font-medium text-lg" style={{ color: 'var(--text)' }} data-testid={`text-name-${p.id}`}>{p.name}</h3>
                 <div className="flex gap-2 text-xs" style={{ color: 'var(--muted-text)' }}>
                   <span className="capitalize">{p.sweetnessPref}</span>
                   <span>•</span>
                   <span className="capitalize">{p.abvComfort} ABV</span>
                 </div>
               </div>
             </div>

             <div className="flex flex-wrap gap-2">
               {p.likedTags?.map((t: string) => (
                 <span key={t} className="chip-speakeasy active text-[10px]">{t}</span>
               ))}
               {p.dislikedTags?.map((t: string) => (
                 <span key={t} className="chip-speakeasy text-[10px] line-through" style={{ color: 'var(--danger)' }}>{t}</span>
               ))}
               {(!p.likedTags || p.likedTags.length === 0) && (!p.dislikedTags || p.dislikedTags.length === 0) && (
                 <span className="text-xs italic" style={{ color: 'var(--muted-text)' }}>No taste data yet...</span>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
