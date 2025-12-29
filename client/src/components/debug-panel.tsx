import { Recipe } from "@/lib/store";
import { Terminal } from "lucide-react";

export default function DebugPanel({ recipe }: { recipe: Recipe }) {
  if (!recipe._debugReasons || recipe._debugReasons.length === 0) return null;

  return (
    <div className="mt-4 p-3 rounded-xl font-mono text-[10px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-2 mb-2 font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
        <Terminal className="w-3 h-3" /> Learning Debug
      </div>
      <ul className="space-y-1">
        {recipe._debugReasons.map((reason, i) => (
          <li key={i} className="flex justify-between pb-0.5 last:border-0" style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--muted-text)' }}>
            <span>{reason.split(':')[0]}</span>
            <span style={{ color: reason.includes('+') ? 'var(--success)' : 'var(--danger)' }}>
              {reason.split(':')[1]}
            </span>
          </li>
        ))}
        <li className="flex justify-between pt-1 font-semibold" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text)' }}>
          <span>Total Score</span>
          <span style={{ color: 'var(--accent)' }}>{recipe._score}</span>
        </li>
      </ul>
    </div>
  );
}
