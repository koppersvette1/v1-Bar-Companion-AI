import { Loader2 } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  progress: number;
}

export default function PullToRefreshIndicator({
  isPulling,
  isRefreshing,
  progress,
}: PullToRefreshIndicatorProps) {
  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className="fixed top-16 left-0 right-0 flex justify-center z-40 pointer-events-none transition-opacity duration-200"
      style={{
        opacity: isRefreshing ? 1 : progress,
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 shadow-lg border border-slate-800">
        <Loader2
          className={`w-4 h-4 text-orange-500 ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: isRefreshing ? 'none' : `rotate(${progress * 360}deg)`,
          }}
        />
        <span className="text-xs text-slate-300 font-medium">
          {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </span>
      </div>
    </div>
  );
}
