import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { X, Upload, Check, Loader2, Camera, ScanLine, Sparkles, DollarSign } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { scanImage } from "@/lib/scanner";

const CATEGORIES = ['spirit', 'liqueur', 'bitters', 'mixer', 'syrup', 'garnish', 'tool', 'accessory'];

export default function AddItemModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { addInventoryItem, settings } = useStore();
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("spirit");
  const [image, setImage] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [mode, setMode] = useState<'scan' | 'review' | 'manual'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("Waiting for image...");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
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
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);

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
      price: price ? parseFloat(price) : undefined,
      bottleSizeMl: size ? parseFloat(size) : undefined,
      tags: [],
    });
    
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="card-speakeasy w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--surface2)' }}>
          <h2 className="text-lg font-display font-medium tracking-wide flex items-center gap-2" style={{ color: 'var(--text)' }}>
            {mode === 'scan' ? <ScanLine className="w-5 h-5" style={{ color: 'var(--accent)' }} /> : <Check className="w-5 h-5" style={{ color: 'var(--success)' }} />}
            {mode === 'scan' ? "Scan Item" : "Confirm Details"}
          </h2>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded-full transition-colors hover:bg-[var(--surface2)]" style={{ color: 'var(--muted-text)' }} data-testid="button-close-modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
          
          {/* SCAN MODE */}
          {mode === 'scan' && (
            <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-in slide-in-from-bottom-4 duration-500">
              
              <div 
                {...getRootProps()}
                className={cn(
                  "relative w-64 h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden group",
                  isDragActive ? "scale-105" : ""
                )}
                style={{ 
                  borderColor: isDragActive ? 'var(--accent)' : 'var(--border-color)',
                  background: isDragActive ? 'rgba(198, 161, 91, 0.1)' : 'var(--surface2)'
                }}
              >
                <input {...getInputProps()} />
                
                {isScanning ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
                    <div className="relative">
                       <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--accent)' }} />
                       <div className="absolute inset-0 animate-ping opacity-20 rounded-full" style={{ background: 'var(--accent)' }} />
                    </div>
                    <div>
                       <p className="font-display font-medium text-lg" style={{ color: 'var(--text)' }}>Scanning...</p>
                       <p className="text-xs mt-1" style={{ color: 'var(--muted-text)' }}>{scanStatus}</p>
                    </div>
                  </div>
                ) : (
                  <>
                     <Camera className="w-16 h-16 mb-4 transition-colors" style={{ color: 'var(--muted-text)' }} />
                     <p className="text-sm text-center px-4" style={{ color: 'var(--muted-text)' }}>
                       <span className="font-semibold" style={{ color: 'var(--text)' }}>Tap to Scan</span><br/> 
                       bottle, can, or tool
                     </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <button 
                  onClick={openFilePicker}
                  className="btn-brass flex flex-col items-center justify-center p-4 rounded-xl"
                  data-testid="button-take-photo"
                >
                  <Camera className="w-6 h-6 mb-2" />
                  <span className="font-semibold text-sm">Take Photo</span>
                </button>
                 <button 
                  onClick={openFilePicker}
                  className="btn-outline-brass flex flex-col items-center justify-center p-4 rounded-xl"
                  data-testid="button-upload"
                >
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="font-semibold text-sm">Upload</span>
                </button>
              </div>

              <button onClick={() => setMode('manual')} className="text-sm underline decoration-dotted" style={{ color: 'var(--muted-text)' }} data-testid="button-manual">
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
                   className="w-24 h-24 rounded-xl flex-shrink-0 overflow-hidden relative group cursor-pointer"
                   style={{ background: 'var(--surface2)', border: '1px solid var(--border-color)' }}
                >
                   {image ? (
                     <>
                       <img src={image} alt="Preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity" style={{ background: 'rgba(0,0,0,0.5)' }}>
                         <Camera className="w-6 h-6" style={{ color: 'var(--text)' }} />
                       </div>
                     </>
                   ) : (
                     <div className="w-full h-full flex items-center justify-center">
                       <Camera className="w-8 h-8" style={{ color: 'var(--muted-text)' }} />
                     </div>
                   )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Detected Item</label>
                  </div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-none text-2xl font-display font-medium p-0 focus:ring-0 focus:outline-none"
                    style={{ color: 'var(--text)' }}
                    placeholder="Name your item..."
                    data-testid="input-item-name"
                  />
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestions.map(s => (
                        <button 
                          key={s} 
                          onClick={() => setName(s)}
                          className="chip-speakeasy text-[10px]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-text)' }}>Category</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn("chip-speakeasy text-[10px] capitalize", category === cat && "active")}
                      data-testid={`button-category-${cat}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {category === 'accessory' && (
                <div className="p-4 rounded-xl flex gap-3 items-start" style={{ background: 'rgba(198, 161, 91, 0.1)', border: '1px solid rgba(198, 161, 91, 0.2)' }}>
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  <p className="text-sm" style={{ color: 'var(--text)' }}>Adding accessories like smokers unlocks new recipe techniques.</p>
                </div>
              )}
              
              {/* COST TRACKING (OPTIONAL) */}
              {settings.enableCostTracking && (
                <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(31, 107, 74, 0.05)', border: '1px solid rgba(31, 107, 74, 0.1)' }}>
                   <div className="flex items-center gap-2" style={{ color: 'var(--success)' }}>
                     <DollarSign className="w-4 h-4" />
                     <span className="text-sm font-semibold uppercase">Cost Details</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs mb-1 block" style={{ color: 'var(--muted-text)' }}>Price Paid</label>
                       <input 
                         type="number" 
                         value={price}
                         onChange={e => setPrice(e.target.value)}
                         placeholder="0.00"
                         className="input-speakeasy w-full rounded-lg px-3 py-2"
                         data-testid="input-price"
                       />
                     </div>
                     <div>
                        <label className="text-xs mb-1 block" style={{ color: 'var(--muted-text)' }}>Size (ml)</label>
                        <input 
                          type="number" 
                          value={size}
                          onChange={e => setSize(e.target.value)}
                          placeholder="750"
                          className="input-speakeasy w-full rounded-lg px-3 py-2"
                          data-testid="input-size"
                        />
                     </div>
                   </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setMode('scan')}
                  className="btn-outline-brass flex-1 py-3 rounded-xl"
                  data-testid="button-retake"
                >
                  Retake
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!name}
                  className="btn-brass flex-[2] py-3 rounded-xl disabled:opacity-50"
                  data-testid="button-save"
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
