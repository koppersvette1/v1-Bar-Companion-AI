import { useState, useEffect } from "react";
import { useStore, InventoryItem } from "@/lib/store"; // Category type is string in new store or inferred?
import { X, Upload, Check, Loader2, Camera, ScanLine, Sparkles, DollarSign } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { scanImage } from "@/lib/scanner";

const CATEGORIES = ['spirit', 'liqueur', 'bitters', 'mixer', 'syrup', 'garnish', 'tool', 'accessory'];

export default function AddItemModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { addInventoryItem, settings } = useStore();
  
  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("spirit");
  const [image, setImage] = useState<string | null>(null);
  
  // Cost State
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  
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
        await new Promise(r => setTimeout(r, 800));

        if (result.detectedName) {
          setName(result.detectedName);
        } else {
          setName("Unknown Item");
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
    noClick: true
  });

  const handleSubmit = () => {
    if (!name) return;
    
    addInventoryItem({
      name,
      category,
      photo: image || undefined,
      quantity: 1,
      // Cost optional
      price: price ? parseFloat(price) : undefined,
      bottleSizeMl: size ? parseFloat(size) : undefined,
      tags: [], // Auto-tagging could happen here
    });
    
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {mode === 'scan' ? <ScanLine className="w-5 h-5 text-orange-500" /> : <Check className="w-5 h-5 text-green-400" />}
            {mode === 'scan' ? "Scan Item" : "Confirm Details"}
          </h2>
          <button onClick={() => onOpenChange(false)} className="text-slate-500 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
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
                  isDragActive ? "border-orange-500 bg-orange-500/10 scale-105" : "border-slate-800 bg-black/20"
                )}
              >
                <input {...getInputProps()} />
                
                {isScanning ? (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 space-y-4">
                    <div className="relative">
                       <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                       <div className="absolute inset-0 animate-ping opacity-20 bg-orange-500 rounded-full" />
                    </div>
                    <div>
                       <p className="text-white font-bold text-lg">Scanning...</p>
                       <p className="text-xs text-slate-500 mt-1">{scanStatus}</p>
                    </div>
                  </div>
                ) : (
                  <>
                     <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-slow" />
                     <Camera className="w-16 h-16 text-slate-600 mb-4 group-hover:text-orange-500 transition-colors" />
                     <p className="text-sm text-slate-500 text-center px-4">
                       <span className="text-white font-bold">Tap to Scan</span><br/> 
                       bottle, can, or tool
                     </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <button 
                  onClick={openFilePicker}
                  className="flex flex-col items-center justify-center p-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                >
                  <Camera className="w-6 h-6 mb-2" />
                  <span className="font-bold text-sm">Take Photo</span>
                </button>
                 <button 
                  onClick={openFilePicker}
                  className="flex flex-col items-center justify-center p-4 bg-slate-800 text-white border border-slate-700 rounded-2xl hover:bg-slate-700 transition-all active:scale-95"
                >
                  <Upload className="w-6 h-6 mb-2 text-slate-400" />
                  <span className="font-bold text-sm">Upload</span>
                </button>
              </div>

              <button onClick={() => setMode('manual')} className="text-sm text-slate-500 hover:text-white underline decoration-dotted">
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
                   className="w-24 h-24 rounded-xl bg-black/40 border border-slate-800 flex-shrink-0 overflow-hidden relative group cursor-pointer"
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
                       <Camera className="w-8 h-8 text-slate-600" />
                     </div>
                   )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-orange-500 uppercase tracking-wider">Detected Item</label>
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
                          className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-orange-500/20 hover:text-orange-500 transition-colors border border-slate-700"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "px-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border text-center",
                        category === cat 
                          ? "bg-orange-500 text-white border-orange-500" 
                          : "bg-slate-800 text-slate-500 border-transparent hover:border-slate-700"
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
                  <p>Adding accessories like smokers or shakers unlocks new recipe techniques.</p>
                </div>
              )}
              
              {/* COST TRACKING (OPTIONAL) */}
              {settings.enableCostTracking && (
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 space-y-3">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-green-500">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase">Cost Details</span>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs text-slate-500 mb-1 block">Price Paid</label>
                       <input 
                         type="number" 
                         value={price}
                         onChange={e => setPrice(e.target.value)}
                         placeholder="0.00"
                         className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-green-500/50"
                       />
                     </div>
                     <div>
                        <label className="text-xs text-slate-500 mb-1 block">Size (ml)</label>
                        <input 
                          type="number" 
                          value={size}
                          onChange={e => setSize(e.target.value)}
                          placeholder="750"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-green-500/50"
                        />
                     </div>
                   </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setMode('scan')}
                  className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
                >
                  Retake
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!name}
                  className="flex-[2] py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
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
