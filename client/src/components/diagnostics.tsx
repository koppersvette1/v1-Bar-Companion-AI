import { useState } from "react";
import { useStore } from "@/lib/store";
import { X, Settings as SettingsIcon, AlertTriangle, User, DollarSign, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DiagnosticsModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { inventory, userSettings, updateSettings, reset } = useStore();
  const [name, setName] = useState(userSettings.name);
  const { toast } = useToast();

  if (!open) return null;

  const handleSave = () => {
    updateSettings({ name });
    toast({ title: "Profile Saved", description: "Your settings have been updated." });
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            Settings
          </h2>
          <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* General Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">General Profile</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Smoker Settings */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Smoker Configuration</h3>
             <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="font-bold text-white text-sm">Cocktail Smoker Owner</div>
                <div className="text-xs text-muted-foreground">Enables wood pairing & timers</div>
              </div>
              <button 
                onClick={() => updateSettings({ hasSmoker: !userSettings.hasSmoker })}
                className={`w-12 h-6 rounded-full relative transition-colors ${userSettings.hasSmoker ? 'bg-orange-500' : 'bg-white/10'}`}
              >
                 <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${userSettings.hasSmoker ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Cost Tracking */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Advanced Features</h3>
             <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-500 h-fit">
                   <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Drink Cost Tracking</div>
                  <div className="text-xs text-muted-foreground max-w-[200px]">
                    Estimate cost per drink based on bottle prices. Optional.
                  </div>
                </div>
              </div>
              <button 
                onClick={() => updateSettings({ enableCostTracking: !userSettings.enableCostTracking })}
                className={`w-12 h-6 rounded-full relative transition-colors ${userSettings.enableCostTracking ? 'bg-green-500' : 'bg-white/10'}`}
              >
                 <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${userSettings.enableCostTracking ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            {userSettings.enableCostTracking && (
              <div className="text-xs text-muted-foreground bg-green-500/5 p-3 rounded-lg border border-green-500/10 flex items-start gap-2">
                 <Calculator className="w-4 h-4 mt-0.5 flex-shrink-0" />
                 Prices are stored locally on your device. Turning this off hides the data but doesn't delete it.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
             <button 
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90"
              >
                Save Changes
              </button>
          </div>

          <div className="pt-8 mt-4 border-t border-white/5">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Danger Zone</h4>
            <button 
              onClick={() => {
                if (confirm("This will wipe all inventory and settings. Are you sure?")) {
                  reset();
                  onOpenChange(false);
                  window.location.reload();
                }
              }}
              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 w-full p-2 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Reset App Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
