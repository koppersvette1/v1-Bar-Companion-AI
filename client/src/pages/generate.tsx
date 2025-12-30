import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, Wine, Coffee, Flame, AlertTriangle, ChevronDown, ChevronUp, Baby } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateBatch, GenerationError } from "@/lib/api";
import type { BatchGenerationResult, GeneratedDrink } from "@shared/generation-types";

function DrinkCard({ drink }: { drink: GeneratedDrink }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card 
      className={`bg-slate-800/50 border-slate-700 ${drink.isFallback ? 'border-amber-600/30' : ''}`}
      data-testid={`card-drink-${drink.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-serif text-white flex items-center gap-2">
              {drink.name}
              {drink.category === 'mocktail' && (
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">NA</Badge>
              )}
              {drink.category === 'kid-friendly' && (
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">Kid-Friendly</Badge>
              )}
              {drink.isFallback && (
                <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30">Template</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              {drink.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {drink.tags.slice(0, 4).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-400">
                {tag}
              </Badge>
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-slate-400 hover:text-white w-full justify-between"
            data-testid={`button-expand-${drink.id}`}
          >
            <span>{expanded ? "Hide details" : "Show recipe"}</span>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {expanded && (
            <div className="space-y-4 pt-2 border-t border-slate-700">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Ingredients</h4>
                <ul className="space-y-1">
                  {drink.ingredients.map((ing, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-center gap-2">
                      <span className="text-orange-500">{ing.amount} {ing.unit}</span>
                      <span>{ing.name}</span>
                      {ing.isOptional && <span className="text-slate-500">(optional)</span>}
                      {ing.isNASpirit && <Badge className="text-xs bg-green-600/20 text-green-400">NA Spirit</Badge>}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Steps</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {drink.steps.map((step, i) => (
                    <li key={i} className="text-sm text-slate-400">{step}</li>
                  ))}
                </ol>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span><strong className="text-slate-300">Glass:</strong> {drink.glassware}</span>
                <span><strong className="text-slate-300">Garnish:</strong> {drink.garnish}</span>
              </div>
              
              {drink.fallbackReason && (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-900/20 p-2 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  {drink.fallbackReason}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DrinkSection({ 
  title, 
  drinks, 
  icon: Icon, 
  badge,
  expectedMin,
  expectedMax 
}: { 
  title: string; 
  drinks: GeneratedDrink[]; 
  icon: React.ElementType;
  badge?: React.ReactNode;
  expectedMin: number;
  expectedMax: number;
}) {
  const countValid = drinks.length >= expectedMin && drinks.length <= expectedMax;
  
  return (
    <section className="space-y-4" data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif text-white flex items-center gap-2">
          <Icon className="h-5 w-5 text-orange-500" />
          {title}
          {badge}
        </h2>
        <Badge 
          className={countValid 
            ? "bg-green-600/20 text-green-400" 
            : "bg-red-600/20 text-red-400"
          }
        >
          {drinks.length} / {expectedMin}-{expectedMax}
        </Badge>
      </div>
      {drinks.length === 0 ? (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="py-8 text-center">
            <p className="text-slate-500">No drinks in this category</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drinks.map(drink => (
            <DrinkCard key={drink.id} drink={drink} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Generate() {
  const { toast } = useToast();
  const [includeKidFriendly, setIncludeKidFriendly] = useState(false);
  const [allowCaffeine, setAllowCaffeine] = useState(false);
  const [allowSpicy, setAllowSpicy] = useState(false);

  const generateMutation = useMutation({
    mutationFn: generateBatch,
    onError: (error: Error) => {
      if (error instanceof GenerationError) {
        toast({
          variant: "destructive",
          title: `Generation Failed (${error.status})`,
          description: `${error.endpoint}: ${error.responseText}`,
        });
        if (import.meta.env.DEV) {
          console.error('[Generation Error]', {
            endpoint: error.endpoint,
            status: error.status,
            responseText: error.responseText,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: error.message,
        });
      }
    },
    onSuccess: (data) => {
      if (import.meta.env.DEV) {
        console.log('[Generation Success]', data);
      }
      toast({
        title: "Drinks Generated!",
        description: `${data.alcoholic.length} cocktails, ${data.mocktailsNA.length} mocktails${data.kidMocktailsNA ? `, ${data.kidMocktailsNA.length} kid-friendly` : ''}`,
      });
    },
  });

  const handleGenerate = () => {
    if (generateMutation.isPending) return;
    
    generateMutation.mutate({
      includeKidFriendly,
      allowCaffeineInKidMocktails: allowCaffeine,
      allowSpicyInKidMocktails: allowSpicy,
    });
  };

  const result = generateMutation.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-orange-500" />
          Generate Drinks
        </h1>
        <p className="text-slate-400 mt-2">
          Get a curated batch of cocktails and mocktails based on your preferences.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Generation Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="kid-friendly" className="text-slate-200">Include Kid-Friendly Mocktails</Label>
              <p className="text-sm text-slate-500">Add 2-3 extra NA drinks suitable for children</p>
            </div>
            <Switch 
              id="kid-friendly" 
              checked={includeKidFriendly} 
              onCheckedChange={setIncludeKidFriendly}
              disabled={generateMutation.isPending}
              data-testid="switch-kid-friendly"
            />
          </div>
          
          {includeKidFriendly && (
            <>
              <Separator className="bg-slate-800" />
              <div className="space-y-4 pl-4 border-l-2 border-orange-500/30">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-caffeine" className="text-slate-200 flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-slate-400" />
                      Allow Caffeine
                    </Label>
                    <p className="text-sm text-slate-500">Include drinks with cola, coffee flavors</p>
                  </div>
                  <Switch 
                    id="allow-caffeine" 
                    checked={allowCaffeine} 
                    onCheckedChange={setAllowCaffeine}
                    disabled={generateMutation.isPending}
                    data-testid="switch-allow-caffeine"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-spicy" className="text-slate-200 flex items-center gap-2">
                      <Flame className="h-4 w-4 text-slate-400" />
                      Allow Spicy
                    </Label>
                    <p className="text-sm text-slate-500">Include drinks with mild heat</p>
                  </div>
                  <Switch 
                    id="allow-spicy" 
                    checked={allowSpicy} 
                    onCheckedChange={setAllowSpicy}
                    disabled={generateMutation.isPending}
                    data-testid="switch-allow-spicy"
                  />
                </div>
              </div>
            </>
          )}
          
          <Button 
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-generate"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Drink Batch
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generateMutation.isError && (
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="py-4">
            <p className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {generateMutation.error instanceof GenerationError 
                ? `${generateMutation.error.endpoint} returned ${generateMutation.error.status}: ${generateMutation.error.responseText}`
                : generateMutation.error.message
              }
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-8">
          {!result.validationPassed && result.validationErrors && (
            <Card className="bg-amber-900/20 border-amber-700">
              <CardContent className="py-4">
                <p className="text-amber-400 flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  Some validation issues occurred:
                </p>
                <ul className="list-disc list-inside text-sm text-amber-300/80">
                  {result.validationErrors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          <DrinkSection 
            title="Cocktails" 
            drinks={result.alcoholic || []} 
            icon={Wine}
            expectedMin={5}
            expectedMax={6}
          />
          
          <Separator className="bg-slate-800" />
          
          <DrinkSection 
            title="Mocktails NA" 
            drinks={result.mocktailsNA || []} 
            icon={Sparkles}
            badge={<Badge className="ml-2 bg-green-600/20 text-green-400 border-green-600/30">Non-Alcoholic</Badge>}
            expectedMin={3}
            expectedMax={4}
          />
          
          {(result.kidMocktailsNA && result.kidMocktailsNA.length > 0) && (
            <>
              <Separator className="bg-slate-800" />
              
              <DrinkSection 
                title="Kid-Friendly Mocktails" 
                drinks={result.kidMocktailsNA} 
                icon={Baby}
                badge={<Badge className="ml-2 bg-blue-600/20 text-blue-400 border-blue-600/30">Kid-Safe</Badge>}
                expectedMin={2}
                expectedMax={3}
              />
            </>
          )}
          
          <p className="text-xs text-slate-500 text-center">
            Generated at {new Date(result.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
