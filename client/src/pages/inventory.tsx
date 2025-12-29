import { useStore } from "@/lib/store";
import { FlaskConical, Plus, Search, ScanLine, Edit2, Trash2, DollarSign } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import AddItemModal from "@/components/add-item-modal"; // I will restore this

export default function Inventory() {
  const { inventory, removeInventoryItem, loadSeedData, settings } = useStore();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredItems = inventory.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.brand && item.brand.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const categories = ['spirit', 'liqueur', 'bitters', 'mixer', 'garnish', 'tool', 'accessory'];

  return (
    <div className="space-y-6">
      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />

      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-serif font-bold text-white">My Bar</h1>
           <p className="text-slate-400 text-sm">Manage ingredients & tools</p>
        </div>
        <div className="flex gap-2">
           {inventory.length === 0 && (
             <button onClick={loadSeedData} className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium">Load Demo</button>
           )}
           <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2">
             <ScanLine className="w-4 h-4" /> Scan
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Search & Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button 
             onClick={() => setFilter('all')}
             className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", filter === 'all' ? "bg-orange-500 text-white border-orange-500" : "bg-transparent text-slate-400 border-slate-800")}
          >
            All
          </button>
          {categories.map(c => (
            <button 
               key={c}
               onClick={() => setFilter(c)}
               className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize", filter === c ? "bg-orange-500 text-white border-orange-500" : "bg-transparent text-slate-400 border-slate-800")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
         {filteredItems.length === 0 ? (
           <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
             <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
             <p>No items found.</p>
           </div>
         ) : (
           filteredItems.map(item => (
             <div key={item.id} className="relative aspect-[3/4] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden group">
                {item.photo ? (
                  <img src={item.photo} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <span className="text-4xl font-serif text-slate-600 font-bold">{item.name[0]}</span>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex gap-1 mb-1">
                     <span className="text-[10px] font-bold uppercase bg-white/10 text-slate-300 px-1.5 py-0.5 rounded">{item.category}</span>
                     {settings.enableCostTracking && item.price && (
                       <span className="text-[10px] font-bold uppercase bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                         <DollarSign className="w-2 h-2" />{item.price}
                       </span>
                     )}
                  </div>
                  <h3 className="font-serif font-bold text-white leading-tight">{item.name}</h3>
                  {item.brand && <p className="text-xs text-slate-400">{item.brand}</p>}
                </div>

                <button 
                  onClick={() => removeInventoryItem(item.id)}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
             </div>
           ))
         )}
      </div>
    </div>
  );
}
