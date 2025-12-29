import { useStore } from "@/lib/store";
import { Settings as SettingsIcon, DollarSign, Calculator, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { settings, updateSettings, reset } = useStore();
  const { toast } = useToast();

  const handleReset = () => {
    if (confirm("Reset everything?")) {
      reset();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm">App configuration</p>
      </div>

      <div className="space-y-6">
        
        {/* Cost Tracking */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
           <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="flex-1">
                 <h3 className="text-lg font-bold text-white">Drink Cost Tracking</h3>
                 <p className="text-sm text-slate-400 mt-1">
                   Estimate cost per drink and batch using your bottle prices. Data is stored locally.
                 </p>
              </div>
              <button 
                onClick={() => updateSettings({ enableCostTracking: !settings.enableCostTracking })}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors flex-shrink-0 mt-1",
                  settings.enableCostTracking ? "bg-green-500" : "bg-slate-700"
                )}
              >
                <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", settings.enableCostTracking ? "translate-x-6" : "translate-x-0")} />
              </button>
           </div>
           
           {settings.enableCostTracking && (
             <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3 text-xs text-green-400 flex gap-2">
               <Calculator className="w-4 h-4" />
               Prices will now appear in inventory and recipe breakdowns.
             </div>
           )}
        </div>

        {/* Smoker */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
           <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-lg font-bold text-white">Smoker Owner</h3>
                 <p className="text-sm text-slate-400">Unlock wood profiles and timers</p>
              </div>
               <button 
                onClick={() => updateSettings({ hasSmoker: !settings.hasSmoker })}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors flex-shrink-0",
                  settings.hasSmoker ? "bg-orange-500" : "bg-slate-700"
                )}
              >
                <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", settings.hasSmoker ? "translate-x-6" : "translate-x-0")} />
              </button>
           </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 border-t border-slate-800">
           <button onClick={handleReset} className="w-full py-3 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/10 flex items-center justify-center gap-2">
             <Trash2 className="w-4 h-4" /> Reset Application Data
           </button>
        </div>

      </div>
    </div>
  );
}
