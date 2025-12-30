import { Button } from "@/components/ui/button";
import { Wine, Flame, Users, BookOpen, Utensils, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center py-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wine className="h-12 w-12 text-orange-500" />
            <h1 className="text-5xl font-bold text-white font-serif">BarBuddy</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Your intelligent home bar assistant. Master cocktails, discover pairings, 
            and perfect your smoked drink game.
          </p>
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Get Started
          </Button>
        </header>

        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12 font-serif">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Wine className="h-8 w-8" />}
              title="Cocktail Library"
              description="50+ classic cocktails, mocktails, and kid-friendly drinks with guided recipes"
            />
            <FeatureCard
              icon={<Flame className="h-8 w-8" />}
              title="Smoker Lab"
              description="17 wood profiles, device-aware instructions, and safety guardrails"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Guest Profiles"
              description="Track taste preferences and personalize recommendations for everyone"
            />
            <FeatureCard
              icon={<Utensils className="h-8 w-8" />}
              title="Food Pairing"
              description="Smart meal-to-drink matching with explanations for why it works"
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Education"
              description="Learn smoking techniques, fix common problems, and explore flavor profiles"
            />
            <FeatureCard
              icon={<Star className="h-8 w-8" />}
              title="Flights & Tastings"
              description="Build tasting flights, vote on favorites, and track your palate journey"
            />
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="bg-slate-800/50 rounded-2xl p-8 max-w-2xl mx-auto border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4 font-serif">
              Hybrid Intelligence
            </h3>
            <p className="text-slate-300 mb-6">
              BarBuddy combines expert bartender rules with adaptive learning. 
              Safety guardrails protect you from common mistakes, while personalization 
              learns your preferences over time.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
                Smoke time caps
              </span>
              <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
                Bitters limits
              </span>
              <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
                NA verification
              </span>
              <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
                Kid-safe filtering
              </span>
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-slate-500 text-sm">
          <p>Drink responsibly. BarBuddy helps you make better drinks, not more drinks.</p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-orange-500/50 transition-colors">
      <div className="text-orange-500 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
