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
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-safe">
      <div className="flex items-center justify-between">
         <div>
           <h1 data-testid="text-page-title">Profiles</h1>
           <p className="mt-1" style={{ color: 'var(--muted-text)' }}>Manage taste preferences for friends & family</p>
         </div>
         <button 
           onClick={() => setShowAdd(true)} 
           className="btn-brass px-4 py-2.5 rounded-xl flex items-center gap-2 touch-target"
           data-testid="button-add-person"
         >
           <Plus className="w-4 h-4" /> Add Person
         </button>
      </div>

      {showAdd && (
        <div className="card-speakeasy p-6 space-y-5 scale-in">
           <div className="flex justify-between items-center">
             <h3>New Profile</h3>
             <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg touch-target" style={{ color: 'var(--muted-text)' }} data-testid="button-close-form">
               <X className="w-5 h-5" />
             </button>
           </div>

           {/* Quick Templates */}
           <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
             {TEMPLATES.map(t => (
               <button 
                 key={t.name}
                 onClick={() => applyTemplate(t)}
                 className="card-speakeasy card-hover flex-shrink-0 px-4 py-3 text-left touch-target"
                 data-testid={`button-template-${t.name.toLowerCase().replace(/\s/g, '-')}`}
               >
                 <div className="text-xs font-semibold flex items-center gap-1 mb-1" style={{ color: 'var(--accent)' }}>
                   <Zap className="w-3 h-3" /> {t.name}
                 </div>
                 <div className="text-xs" style={{ color: 'var(--muted-text)' }}>{t.desc}</div>
               </button>
             ))}
           </div>
           
           <div className="space-y-2">
             <label className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--muted-text)' }}>Name</label>
             <input 
               value={name} 
               onChange={e => setName(e.target.value)} 
               className="input-speakeasy w-full rounded-xl p-3"
               placeholder="e.g. Sarah"
               data-testid="input-person-name"
             />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--muted-text)' }}>Sweetness</label>
               <select 
                 value={sweetness} 
                 onChange={e => setSweetness(e.target.value as any)} 
                 className="input-speakeasy w-full rounded-xl p-3 touch-target"
                 data-testid="select-sweetness"
               >
                 <option value="dry">Dry</option>
                 <option value="balanced">Balanced</option>
                 <option value="sweet">Sweet</option>
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--muted-text)' }}>ABV Comfort</label>
               <select 
                 value={abv} 
                 onChange={e => setAbv(e.target.value as any)} 
                 className="input-speakeasy w-full rounded-xl p-3 touch-target"
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
             className="btn-brass w-full py-3 rounded-xl touch-target"
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
          <div key={p.id} className="card-speakeasy card-hover p-5 relative group" data-testid={`card-person-${p.id}`}>
             <button 
               onClick={() => deletePerson.mutate(p.id)} 
               className="absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 tab-transition touch-target"
               style={{ color: 'var(--danger)', background: 'rgba(139, 44, 44, 0.1)' }}
               data-testid={`button-delete-${p.id}`}
             >
               <Trash2 className="w-4 h-4" />
             </button>
             
             <div className="flex items-center gap-4 mb-4">
               <div 
                 className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-display font-semibold"
                 style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #A8884A 100%)', color: 'var(--bg)' }}
               >
                 {p.name[0]}
               </div>
               <div>
                 <h3 className="mb-0.5" data-testid={`text-name-${p.id}`}>{p.name}</h3>
                 <div className="flex gap-2 text-xs" style={{ color: 'var(--muted-text)' }}>
                   <span className="capitalize">{p.sweetnessPref}</span>
                   <span>•</span>
                   <span className="capitalize">{p.abvComfort} ABV</span>
                 </div>
               </div>
             </div>

             <div className="flex flex-wrap gap-2">
               {p.likedTags?.map((t: string) => (
                 <span key={t} className="chip-speakeasy active text-xs">{t}</span>
               ))}
               {p.dislikedTags?.map((t: string) => (
                 <span key={t} className="chip-speakeasy text-xs line-through" style={{ color: 'var(--danger)' }}>{t}</span>
               ))}
               {(!p.likedTags || p.likedTags.length === 0) && (!p.dislikedTags || p.dislikedTags.length === 0) && (
                 <span className="text-sm italic" style={{ color: 'var(--muted-text)' }}>No taste data yet...</span>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
