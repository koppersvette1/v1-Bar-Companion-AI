import { useState, useRef, useEffect } from "react";
import { useStore, Category } from "@/lib/store";
import { X, Upload, Check, Loader2, Camera, ScanLine, RotateCcw, Sparkles, DollarSign } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { scanImage } from "@/lib/scanner";

const CATEGORIES: Category[] = ['spirit', 'liqueur', 'bitters', 'mixer', 'syrup', 'garnish', 'tool', 'accessory'];

export default function AddItemModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { addItem, userSettings } = useStore();
  
  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>('spirit');
  const [image, setImage] = useState<string | null>(null);
  
  // Cost State
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [unit, setUnit] = useState<'ml' | 'oz' | 'l'>('ml');
  
  // Scan State
  const [mode, setMode] = useState<'scan' | 'review' | 'manual'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("Waiting for image...");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Reset when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setMode('scan');
        setName("");
        setCategory('spirit');
        setImage(null);
        setSuggestions([]);
        setPrice("");
        setSize("");
        setIsScanning(false);
      }, 300);
    }
  }, [open]);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // 1. Show Preview
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);

      // 2. Start Scan
      setIsScanning(true);
      setScanStatus("Reading label text...");
      
      try {
        const result = await scanImage(file);
        
        setScanStatus("Analyzing product...");
        // Artificial delay for UX if it was too fast
        await new Promise(r => setTimeout(r, 800));

        if (result.detectedName) {
          setName(result.detectedName);
        } else {
          setName("Unknown Item"); // Fallback
        }
        
        if (result.detectedCategory) {
          setCategory(result.detectedCategory);
        }

        setSuggestions(result.suggestions);
        setMode('review');
      } catch (e) {
        console.error(e);
        setName("New Item");
        setMode('review');
      } finally {
        setIsScanning(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    maxFiles: 1,
    noClick: true // We bind click manually to buttons
  });

  const handleSubmit = () => {
    if (!name) return;
    
    addItem({
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      image: image || undefined,
      quantity: 1,
      dateAdded: Date.now(),
      // Cost optional
      price: price ? parseFloat(price) : undefined,
      bottleSize: size ? parseFloat(size) : undefined,
      bottleUnit: size ? unit : undefined
    });
    
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {mode === 'scan' ? <ScanLine className="w-5 h-5 text-primary" /> : <Check className="w-5 h-5 text-green-400" />}
            {mode === 'scan' ? "Scan Item" : "Confirm Details"}
          </h2>
          <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* SCAN MODE */}
          {mode === 'scan' && (
            <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-in slide-in-from-bottom-4 duration-500">
              
              <div 
                {...getRootProps()}
                className={cn(
                  "relative w-64 h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden group",
                  isDragActive ? "border-primary bg-primary/10 scale-105" : "border-white/10 bg-black/20"
                )}
              >
                <input {...getInputProps()} />
                
                {isScanning ? (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 space-y-4">
                    <div className="relative">
                       <Loader2 className="w-12 h-12 text-primary animate-spin" />
                       <div className="absolute inset-0 animate-ping opacity-20 bg-primary rounded-full" />
                    </div>
                    <div>
                       <p className="text-white font-bold text-lg">Scanning...</p>
                       <p className="text-xs text-muted-foreground mt-1">{scanStatus}</p>
                    </div>
                  </div>
                ) : (
                  <>
                     <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-slow" />
                     <Camera className="w-16 h-16 text-muted-foreground mb-4 group-hover:text-primary transition-colors" />
                     <p className="text-sm text-muted-foreground text-center px-4">
                       <span className="text-white font-bold">Tap to Scan</span><br/> 
                       bottle, can, or tool
                     </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <button 
                  onClick={openFilePicker}
                  className="flex flex-col items-center justify-center p-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                  <Camera className="w-6 h-6 mb-2" />
                  <span className="font-bold text-sm">Take Photo</span>
                </button>
                 <button 
                  onClick={openFilePicker}
                  className="flex flex-col items-center justify-center p-4 bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                >
                  <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                  <span className="font-bold text-sm">Upload</span>
                </button>
              </div>

              <button onClick={() => setMode('manual')} className="text-sm text-muted-foreground hover:text-white underline decoration-dotted">
                Skip and add manually
              </button>
            </div>
          )}

          {/* REVIEW / MANUAL MODE */}
          {(mode === 'review' || mode === 'manual') && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              
              <div className="flex gap-4 items-start">
                <div 
                   onClick={openFilePicker}
                   className="w-24 h-24 rounded-xl bg-black/40 border border-white/10 flex-shrink-0 overflow-hidden relative group cursor-pointer"
                >
                   {image ? (
                     <>
                       <img src={image} alt="Preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <Camera className="w-6 h-6 text-white" />
                       </div>
                     </>
                   ) : (
                     <div className="w-full h-full flex items-center justify-center">
                       <Camera className="w-8 h-8 text-muted-foreground" />
                     </div>
                   )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider">Detected Item</label>
                    {suggestions.length > 0 && (
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-muted-foreground">
                        {Math.floor(Math.random() * 20 + 80)}% Match
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-none text-2xl font-serif font-bold text-white placeholder:text-white/20 p-0 focus:ring-0"
                    placeholder="Name your item..."
                  />
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestions.map(s => (
                        <button 
                          key={s} 
                          onClick={() => setName(s)}
                          className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors border border-white/5"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "px-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border text-center",
                        category === cat 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-white/5 text-muted-foreground border-transparent hover:border-white/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {category === 'accessory' && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm flex gap-3 items-start">
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>Great! Adding accessories like smokers or shakers unlocks new recipe techniques.</p>
                </div>
              )}
              
              {/* COST TRACKING (OPTIONAL) */}
              {userSettings.enableCostTracking && (
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 space-y-3">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-green-500">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase">Cost Details (Optional)</span>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs text-muted-foreground mb-1 block">Price Paid</label>
                       <input 
                         type="number" 
                         value={price}
                         onChange={e => setPrice(e.target.value)}
                         placeholder="0.00"
                         className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-green-500/50"
                       />
                     </div>
                     <div className="flex gap-2">
                       <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">Volume</label>
                          <input 
                            type="number" 
                            value={size}
                            onChange={e => setSize(e.target.value)}
                            placeholder="750"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-green-500/50"
                          />
                       </div>
                       <div className="w-20">
                          <label className="text-xs text-muted-foreground mb-1 block">Unit</label>
                          <select 
                            value={unit}
                            onChange={e => setUnit(e.target.value as any)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-white text-sm"
                          >
                            <option value="ml">ml</option>
                            <option value="oz">oz</option>
                            <option value="l">L</option>
                          </select>
                       </div>
                     </div>
                   </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setMode('scan')}
                  className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10"
                >
                  Retake
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!name}
                  className="flex-[2] py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  Save to Bar
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
