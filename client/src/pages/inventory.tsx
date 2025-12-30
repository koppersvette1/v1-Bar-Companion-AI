import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Search, ScanLine, Trash2, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import AddItemModal from "@/components/add-item-modal";
import type { Inventory, UserSettings } from "@shared/schema";

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const { data: inventory = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
  });

  const filteredItems = inventory.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.brand && item.brand.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const categories = ['spirit', 'liqueur', 'bitters', 'mixer', 'garnish', 'tool', 'accessory'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />

      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-serif font-bold text-white">My Bar</h1>
           <p className="text-slate-400 text-sm">Manage ingredients & tools</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2" data-testid="button-scan">
             <ScanLine className="w-4 h-4" /> Scan
           </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
            data-testid="input-search"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button 
             onClick={() => setFilter('all')}
             className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", filter === 'all' ? "bg-orange-500 text-white border-orange-500" : "bg-transparent text-slate-400 border-slate-800")}
             data-testid="filter-all"
          >
            All
          </button>
          {categories.map(c => (
            <button 
               key={c}
               onClick={() => setFilter(c)}
               className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize", filter === c ? "bg-orange-500 text-white border-orange-500" : "bg-transparent text-slate-400 border-slate-800")}
               data-testid={`filter-${c}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
         {filteredItems.length === 0 ? (
           <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
             <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
             <p>No items found.</p>
             <button 
               onClick={() => setShowAddModal(true)}
               className="mt-4 text-orange-500 hover:text-orange-400 text-sm font-medium"
               data-testid="button-add-first"
             >
               Add your first item
             </button>
           </div>
         ) : (
           filteredItems.map(item => (
             <div key={item.id} className="relative aspect-[3/4] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden group" data-testid={`inventory-item-${item.id}`}>
                {item.photo ? (
                  <img src={item.photo} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={item.name} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <span className="text-4xl font-serif text-slate-600 font-bold">{item.name[0]}</span>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex gap-1 mb-1">
                     <span className="text-[10px] font-bold uppercase bg-white/10 text-slate-300 px-1.5 py-0.5 rounded">{item.category}</span>
                     {settings?.enableCostTracking && item.price && (
                       <span className="text-[10px] font-bold uppercase bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                         <DollarSign className="w-2 h-2" />{item.price}
                       </span>
                     )}
                  </div>
                  <h3 className="font-serif font-bold text-white leading-tight">{item.name}</h3>
                  {item.brand && <p className="text-xs text-slate-400">{item.brand}</p>}
                </div>

                <button 
                  onClick={() => deleteItemMutation.mutate(item.id)}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  data-testid={`button-delete-${item.id}`}
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
