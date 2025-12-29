import { useStore } from "@/lib/store";
import { Link } from "wouter";
import { BookHeart, ArrowRight } from "lucide-react";

export default function Favorites() {
  const { recipes, favorites } = useStore();
  const favRecipes = recipes.filter(r => favorites.includes(r.id));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-white">Favorites</h1>

      {favRecipes.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-3xl">
          <BookHeart className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-bold text-white">No favorites yet</h2>
          <p className="text-slate-400 mt-2">Star recipes to save them here for quick access.</p>
          <Link href="/cocktails">
            <a className="inline-flex items-center gap-2 mt-6 text-orange-500 font-bold hover:underline">
              Browse Cocktails <ArrowRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Reuse card logic or component here later */}
          {favRecipes.map(r => (
            <div key={r.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <h3 className="font-bold text-white text-lg">{r.name}</h3>
              <p className="text-sm text-slate-400">{r.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
