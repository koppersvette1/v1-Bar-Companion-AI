import { useStore } from "@/lib/store";
import { FlaskConical, Search, ScanLine, Trash2, DollarSign } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import AddItemModal from "@/components/add-item-modal";

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
    <div className="space-y-6 pb-safe">
      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />

      <div className="flex items-center justify-between">
        <div>
           <h1 data-testid="text-page-title">My Bar</h1>
           <p className="mt-1" style={{ color: 'var(--muted-text)' }}>Manage ingredients & tools</p>
        </div>
        <div className="flex gap-2">
           {inventory.length === 0 && (
             <button 
               onClick={loadSeedData} 
               className="btn-ghost px-4 py-2.5 rounded-xl touch-target"
               data-testid="button-load-demo"
             >
               Load Demo
             </button>
           )}
           <button 
             onClick={() => setShowAddModal(true)} 
             className="btn-brass px-4 py-2.5 rounded-xl flex items-center gap-2 touch-target"
             data-testid="button-scan"
           >
             <ScanLine className="w-4 h-4" /> Scan
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-text)' }} />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-speakeasy w-full rounded-xl pl-11 pr-4 py-3"
            data-testid="input-search"
          />
        </div>
        
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button 
             onClick={() => setFilter('all')}
             className={cn("chip-speakeasy touch-target", filter === 'all' && "active")}
             data-testid="button-filter-all"
          >
            All
          </button>
          {categories.map(c => (
            <button 
               key={c}
               onClick={() => setFilter(c)}
               className={cn("chip-speakeasy capitalize touch-target", filter === c && "active")}
               data-testid={`button-filter-${c}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         {filteredItems.length === 0 ? (
           <div className="col-span-full py-12 text-center rounded-2xl" style={{ border: '1px dashed var(--border-color)' }}>
             <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: 'var(--muted-text)' }} />
             <p style={{ color: 'var(--muted-text)' }}>No items found.</p>
           </div>
         ) : (
           filteredItems.map(item => (
             <div key={item.id} className="relative aspect-[3/4] card-speakeasy card-hover overflow-hidden group" data-testid={`card-item-${item.id}`}>
                {item.photo ? (
                  <img src={item.photo} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt={item.name} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--surface2)' }}>
                    <span className="text-4xl font-display font-semibold" style={{ color: 'var(--muted-text)' }}>{item.name[0]}</span>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)' }}>
                  <div className="flex gap-1 mb-1.5 flex-wrap">
                     <span className="badge-brass">{item.category}</span>
                     {settings.enableCostTracking && item.price && (
                       <span className="badge-brass flex items-center gap-0.5" style={{ background: 'rgba(31, 107, 74, 0.2)', color: 'var(--success)' }}>
                         <DollarSign className="w-2.5 h-2.5" />{item.price}
                       </span>
                     )}
                  </div>
                  <h3 className="text-base leading-tight">{item.name}</h3>
                  {item.brand && <p className="text-sm mt-0.5" style={{ color: 'var(--muted-text)' }}>{item.brand}</p>}
                </div>

                <button 
                  onClick={() => removeInventoryItem(item.id)}
                  className="absolute top-3 right-3 p-2.5 rounded-full opacity-0 group-hover:opacity-100 tab-transition touch-target"
                  style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--text)' }}
                  data-testid={`button-delete-${item.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
             </div>
           ))
         )}
      </div>
    </div>
  );
}
