import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Wine, GlassWater, Baby, Printer, ThumbsUp, ThumbsDown, Heart, Meh } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Flight, Recipe } from "@shared/schema";

const THEMES = [
  { value: "citrus", label: "Citrus Forward" },
  { value: "spritz", label: "Spritz & Bubbles" },
  { value: "tropical", label: "Tropical" },
  { value: "dessert", label: "Dessert & Sweet" },
  { value: "wine-like", label: "Wine-like" },
  { value: "smoked", label: "Smoked (Alcoholic only)" },
];

export default function Flights() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [category, setCategory] = useState<"alcoholic" | "na" | "kid-friendly">("alcoholic");
  const [theme, setTheme] = useState("citrus");
  const [name, setName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flights = [] } = useQuery<Flight[]>({
    queryKey: ["/api/flights"],
  });

  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const createFlightMutation = useMutation({
    mutationFn: async (flightData: any) => {
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flightData),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create flight");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flights"] });
      setShowBuilder(false);
      setName("");
      toast({ title: "Flight created!" });
    },
  });

  const filteredRecipes = recipes.filter(r => {
    if (category === "alcoholic") return r.category === "alcoholic";
    if (category === "na") return r.category === "mocktail";
    return r.category === "kid-friendly";
  });

  const handleCreateFlight = () => {
    const selectedRecipes = filteredRecipes
      .filter(r => theme === "smoked" ? r.isSmoked : r.tags?.includes(theme) || true)
      .slice(0, category === "kid-friendly" ? 3 : 4);

    if (selectedRecipes.length < 2) {
      toast({ title: "Not enough recipes", description: "Add more recipes to create a flight", variant: "destructive" });
      return;
    }

    createFlightMutation.mutate({
      name: name || `${category} ${theme} Flight`,
      category,
      theme,
      recipeIds: selectedRecipes.map(r => r.id),
      pourSize: "tasting",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-serif">Flight Mode</h1>
          <p className="text-slate-400">Create tasting flights and discover your favorites</p>
        </div>
        <Button 
          onClick={() => setShowBuilder(!showBuilder)}
          className="bg-orange-500 hover:bg-orange-600"
          data-testid="button-new-flight"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Flight
        </Button>
      </div>

      {showBuilder && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Build Your Flight</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Flight Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Tasting Flight"
                className="bg-slate-700 border-slate-600"
                data-testid="input-flight-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Tabs value={category} onValueChange={(v) => setCategory(v as any)}>
                <TabsList className="grid grid-cols-3 bg-slate-700">
                  <TabsTrigger value="alcoholic" className="gap-2" data-testid="tab-alcoholic">
                    <Wine className="h-4 w-4" /> Cocktails
                  </TabsTrigger>
                  <TabsTrigger value="na" className="gap-2" data-testid="tab-na">
                    <GlassWater className="h-4 w-4" /> Mocktails
                  </TabsTrigger>
                  <TabsTrigger value="kid-friendly" className="gap-2" data-testid="tab-kids">
                    <Baby className="h-4 w-4" /> Kid-Friendly
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.filter(t => category !== "alcoholic" ? t.value !== "smoked" : true).map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleCreateFlight}
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={createFlightMutation.isPending}
                data-testid="button-create-flight"
              >
                Create Flight ({category === "kid-friendly" ? "3" : "3-4"} drinks)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {flights.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <Wine className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No flights yet. Create your first tasting flight!</p>
            </CardContent>
          </Card>
        ) : (
          flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} recipes={recipes} />
          ))
        )}
      </div>
    </div>
  );
}

function FlightCard({ flight, recipes }: { flight: Flight; recipes: Recipe[] }) {
  const flightRecipes = recipes.filter(r => flight.recipeIds.includes(r.id));

  return (
    <Card className="bg-slate-800 border-slate-700" data-testid={`card-flight-${flight.id}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">{flight.name}</CardTitle>
          <p className="text-slate-400 text-sm capitalize">{flight.category} • {flight.theme}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Printer className="h-4 w-4" /> Placemat
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {flightRecipes.map((recipe, i) => (
            <div key={recipe.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-white">{recipe.name}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300">
                  <Meh className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
