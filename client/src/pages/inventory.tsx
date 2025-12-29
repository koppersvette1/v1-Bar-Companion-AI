import { useState } from "react";
import { useStore, Category, Item } from "@/lib/store";
import { Plus, Search, Filter, ScanLine, Trash2, Edit2, FlaskConical, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import AddItemModal from "@/components/add-item-modal";

const CATEGORIES: Category[] = ['spirit', 'liqueur', 'bitters', 'mixer', 'syrup', 'garnish', 'tool', 'accessory'];

export default function Inventory() {
  const { inventory, removeItem, loadDemoData } = useStore();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredItems = inventory.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.brand && item.brand.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">My Cabinet</h1>
          <p className="text-muted-foreground">Manage your ingredients and tools.</p>
        </div>
        <div className="flex gap-2">
          {inventory.length === 0 && (
             <button 
              onClick={loadDemoData}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-medium hover:bg-secondary/80 transition-colors"
            >
              <FlaskConical className="w-4 h-4" /> Load Demo
            </button>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <ScanLine className="w-4 h-4" /> Scan Item
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name, brand, or type..." 
            className="w-full bg-card/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white placeholder:text-muted-foreground/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-right">
          <button 
            onClick={() => setFilter('all')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
              filter === 'all' 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-transparent text-muted-foreground border-white/10 hover:border-white/20"
            )}
          >
            All Items
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-all border",
                filter === cat 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-transparent text-muted-foreground border-white/10 hover:border-white/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-3xl min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
             <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No items found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
          {filteredItems.map((item) => (
            <div key={item.id} className="group relative aspect-[3/4] bg-card/40 rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
              {/* Image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
              
              {item.image ? (
                 <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
              ) : (
                 <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                   <span className="text-4xl opacity-20 font-serif font-bold">{item.name[0]}</span>
                 </div>
              )}
             
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <div className="flex gap-2 mb-2">
                   <span className="inline-block px-2 py-0.5 rounded-sm bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white/80">
                    {item.category}
                   </span>
                   {item.subtype && (
                     <span className="inline-block px-2 py-0.5 rounded-sm bg-primary/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-primary">
                      {item.subtype}
                     </span>
                   )}
                </div>
                
                <h3 className="text-lg font-serif font-bold text-white leading-tight mb-1">{item.name}</h3>
                {item.brand && <p className="text-xs text-muted-foreground font-medium">{item.brand}</p>}
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-primary-foreground transition-colors">
                   <Edit2 className="w-3 h-3" />
                 </button>
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-destructive hover:text-white transition-colors"
                 >
                   <Trash2 className="w-3 h-3" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
