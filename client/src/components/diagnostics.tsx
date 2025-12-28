import { useState } from "react";
import { useStore } from "@/lib/store";
import { X, Check, Copy, AlertTriangle, Settings as SettingsIcon, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DiagnosticsModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { inventory, settings, updateSettings, resetStore } = useStore();
  const [apiKey, setApiKey] = useState(settings.openAiKey || "");
  const { toast } = useToast();

  if (!open) return null;

  const handleSaveKey = () => {
    updateSettings({ openAiKey: apiKey, useOpenAi: !!apiKey });
    toast({ title: "Settings Saved", description: apiKey ? "API Key updated." : "Using local mode." });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            System Diagnostics & Settings
          </h2>
          <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Inventory</div>
              <div className="text-2xl font-bold text-white">{inventory.length} Items</div>
            </div>
            <div className={`p-4 rounded-xl border ${settings.useOpenAi ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">AI Status</div>
              <div className={`text-2xl font-bold ${settings.useOpenAi ? 'text-green-400' : 'text-yellow-400'}`}>
                {settings.useOpenAi ? 'Online' : 'Local Mode'}
              </div>
            </div>
          </div>

          {/* API Key Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">OpenAI API Key (Optional)</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary/50"
              />
              <button 
                onClick={handleSaveKey}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Without a key, the app runs in "Demo Mode" using a built-in rule engine. Add a key to enable real AI generation.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-white/5">
            <button 
              onClick={() => {
                if (confirm("Are you sure? This will wipe all data.")) {
                  resetStore();
                  onOpenChange(false);
                  window.location.reload();
                }
              }}
              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Reset Application Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
