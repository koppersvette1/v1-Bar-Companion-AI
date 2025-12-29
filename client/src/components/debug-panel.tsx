import { Recipe } from "@/lib/store";
import { Terminal } from "lucide-react";

export default function DebugPanel({ recipe }: { recipe: Recipe }) {
  if (!recipe._debugReasons || recipe._debugReasons.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-black/40 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-400">
      <div className="flex items-center gap-2 mb-2 text-orange-500 font-bold uppercase tracking-wider">
        <Terminal className="w-3 h-3" /> Learning Debug
      </div>
      <ul className="space-y-1">
        {recipe._debugReasons.map((reason, i) => (
          <li key={i} className="flex justify-between border-b border-white/5 pb-0.5 last:border-0">
            <span>{reason.split(':')[0]}</span>
            <span className={reason.includes('+') ? "text-green-400" : "text-red-400"}>
              {reason.split(':')[1]}
            </span>
          </li>
        ))}
        <li className="flex justify-between pt-1 font-bold text-white border-t border-white/10">
          <span>Total Score</span>
          <span>{recipe._score}</span>
        </li>
      </ul>
    </div>
  );
}
