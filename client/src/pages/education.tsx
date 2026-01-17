import { useState } from 'react';
import { useStore, Wood } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, Flame, TreePine, AlertTriangle, CheckCircle2, 
  Wrench, FlaskConical, ChevronDown, ChevronRight,
  ThermometerSun, Droplets, Timer, Wind
} from 'lucide-react';

const SMOKE_BASICS = {
  intro: "Smoke is aroma-first. The goal is to add complexity and depth, not to overpower your drink. Think of smoke like seasoning—a little goes a long way.",
  keyPrinciples: [
    { title: "Lighter woods = elegance", desc: "Apple, Pear, and Cherry add subtle fruit notes without bitterness risk." },
    { title: "Stronger woods = bitterness risk", desc: "Hickory and Mesquite require shorter times and careful attention." },
    { title: "Smoke the glass, not the drink", desc: "Default method: capture smoke in the glass, then pour your cocktail." },
    { title: "Rest is essential", desc: "Let smoke settle 20-30s before pouring to avoid harsh top notes." },
    { title: "Bitters reduction for smoked drinks", desc: "Reduce bitters by 30-50% when smoking—smoke adds its own bitter compounds." },
  ],
  interactions: [
    { element: "Sweetness", effect: "Smoke rounds sweetness and adds caramel notes. Balance with slightly less sugar." },
    { element: "Acidity", effect: "Citrus lifts and brightens smoke. Fresh lemon/orange oil post-smoke is your friend." },
    { element: "Bitterness", effect: "Smoke adds bitter compounds. Reduce Campari/bitters or risk over-extraction." },
    { element: "Dilution", effect: "Proper dilution opens up smoke aromatics. Under-stirred = harsh smoke." },
    { element: "Spirit-forward", effect: "High-proof spirits handle smoke better. Low-ABV drinks can get muddled." },
  ],
  guardrails: [
    "Always use recommended time ranges per wood intensity",
    "Hickory: max 8s | Mesquite: max 7s | Oak: max 12s",
    "Max 2 dashes bitters for smoked drinks",
    "Never smoke directly into finished cocktail (use glass method)",
    "Clean your smoker regularly to avoid ashy/stale notes",
  ]
};

const SENSORY_CHECKLIST = {
  greenFlags: [
    { sense: "Nose", sign: "Clean wood aroma, no ash or burnt smell" },
    { sense: "Nose", sign: "Fruit/vanilla/toast notes depending on wood" },
    { sense: "Palate", sign: "Smoke integrates with spirit, doesn't dominate" },
    { sense: "Palate", sign: "Balanced sweetness and gentle tannin" },
    { sense: "Finish", sign: "Pleasant lingering warmth, no harsh aftertaste" },
    { sense: "Finish", sign: "Spirit character still present" },
  ],
  redFlags: [
    { sense: "Nose", sign: "Ashy, sooty, or burnt plastic smell" },
    { sense: "Nose", sign: "Overwhelming campfire that masks everything" },
    { sense: "Palate", sign: "Harsh bitterness that dries mouth uncomfortably" },
    { sense: "Palate", sign: "Flat or dull—no brightness or lift" },
    { sense: "Finish", sign: "Bitter aftertaste that lingers too long" },
    { sense: "Finish", sign: "Spirit completely masked by smoke" },
  ]
};

const FIX_IT_PROBLEMS = [
  {
    id: 'too-smoky',
    problem: "Too Smoky",
    why: "Over-smoked or used too strong a wood. Smoke captured too long or not enough rest time.",
    fixes: [
      "Express fresh citrus oils over drink to lift",
      "Add a splash of fresh citrus juice",
      "Use shorter smoke time next time",
      "Switch to lighter wood (Apple, Pear, Maple)"
    ],
    garnishFix: "Fresh citrus peel expressed over glass"
  },
  {
    id: 'too-bitter',
    problem: "Too Bitter",
    why: "Smoke added bitter compounds on top of existing bitters/Campari. Or smoked too long with intense wood.",
    fixes: [
      "Reduce bitters by 30-50% when smoking",
      "Use shorter smoke time",
      "Add small amount of simple syrup to balance",
      "Express citrus to brighten"
    ],
    garnishFix: "Citrus oil expression + consider herb garnish"
  },
  {
    id: 'flat-dull',
    problem: "Flat / Dull",
    why: "Over-diluted, smoke has settled and gone stale, or missing acidic balance.",
    fixes: [
      "Express fresh citrus oils—this lifts everything",
      "Add a few drops of fresh lemon juice",
      "Stir less next time (check dilution)",
      "Serve immediately after smoking"
    ],
    garnishFix: "Fresh citrus peel + aromatic herb sprig"
  },
  {
    id: 'too-sweet',
    problem: "Too Sweet",
    why: "Smoke's caramel notes added to existing sweetness. Maple/Pecan woods especially sweet.",
    fixes: [
      "Reduce syrup/sugar in recipe by 25%",
      "Add a few drops of bitters (within caps)",
      "Express citrus to cut sweetness",
      "Use dryer wood (Oak, Walnut, Grapevine)"
    ],
    garnishFix: "Citrus oil + consider smoked salt rim"
  },
  {
    id: 'too-sharp',
    problem: "Too Sharp / Hot",
    why: "Under-diluted or smoke hasn't integrated. High-proof spirit dominating.",
    fixes: [
      "Stir/shake longer for proper dilution",
      "Let drink rest 30s after smoke settles",
      "Add small ice chip to glass",
      "Use rounder wood (Cherry, Pecan)"
    ],
    garnishFix: "Luxardo cherry or dehydrated citrus"
  },
  {
    id: 'no-spirit',
    problem: "Can't Taste Spirit",
    why: "Over-smoked or too bold a wood. Smoke is masking the base spirit character.",
    fixes: [
      "Use shorter smoke time",
      "Switch to lighter wood",
      "Use higher-proof spirit",
      "Smoke glass only, not the drink"
    ],
    garnishFix: "Simple garnish—let spirit shine"
  },
  {
    id: 'ashy-sooty',
    problem: "Ashy / Sooty",
    why: "Smoker needs cleaning, wood burned too hot, or captured too long.",
    fixes: [
      "Clean smoker chamber thoroughly",
      "Use lower torch flame—steady, not roaring",
      "Shorter capture time",
      "Let glass vent briefly before capturing"
    ],
    garnishFix: "Fresh aromatic herb to mask"
  }
];

const GUIDED_EXPERIMENTS = [
  {
    id: 'fruitwood-flight',
    name: "Fruitwood Flight",
    description: "Compare Apple vs Cherry vs Pear on the same base drink to understand subtle fruitwood differences.",
    baseDrink: "Classic Old Fashioned",
    woods: ["Apple", "Cherry", "Pear"],
    setup: "Make 3 identical Old Fashioned specs. Smoke each glass with a different fruitwood for 15 seconds.",
    whatToNotice: [
      "Apple: Lightest, most elegant, subtle sweetness",
      "Cherry: Richer, more pronounced fruit, works with darker spirits",
      "Pear: Wine-like, floral, pairs with lighter citrus notes"
    ],
    difficulty: "Beginner"
  },
  {
    id: 'clean-vs-bold',
    name: "Clean vs Bold",
    description: "Experience the dramatic difference between light and intense woods. Strict time caps apply!",
    baseDrink: "Bourbon Neat or Simple Whiskey Sour",
    woods: ["Alder", "Hickory"],
    setup: "Smoke one glass with Alder (12s) and one with Hickory (6s MAX). Note the strictness on Hickory.",
    whatToNotice: [
      "Alder: Clean, almost neutral, lets spirit shine",
      "Hickory: Savory, bacon-like, can overwhelm if overdone",
      "Feel the difference in 'weight' each adds to the drink"
    ],
    difficulty: "Intermediate",
    warning: "Hickory max 8s! Go shorter if unsure."
  },
  {
    id: 'wine-like-spritz',
    name: "Wine-Like Spritz Smoke",
    description: "For wine lovers: explore structured, tannic smoke profiles on lighter drinks.",
    baseDrink: "Gin & Tonic or Aperol Spritz",
    woods: ["Pear", "Grapevine"],
    setup: "Make two identical spritzes or G&Ts. Smoke glasses with Pear (14s) and Grapevine (10s).",
    whatToNotice: [
      "Pear: Elegant, wine-like fruitiness, floral notes",
      "Grapevine: Tannic, structured, like red wine barrel aging",
      "Both add sophistication without overwhelming bubbles"
    ],
    difficulty: "Beginner"
  },
  {
    id: 'dessert-flight',
    name: "Dessert & After-Dinner",
    description: "Sweet, rich smoke profiles perfect for after-dinner drinks.",
    baseDrink: "Espresso Martini or Bourbon with Maple",
    woods: ["Maple", "Pecan"],
    setup: "Smoke glasses with Maple (12s) and Pecan (10s). Try with coffee-based or fall-flavored drinks.",
    whatToNotice: [
      "Maple: Caramel sweetness, smooth, dessert-forward",
      "Pecan: Nutty richness, spiced, more complexity",
      "Both complement sweet and coffee flavors beautifully"
    ],
    difficulty: "Beginner"
  }
];

function WoodFlavorGuide({ wood }: { wood: Wood }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const intensityColor = {
    'light': 'bg-green-500/20 text-green-400',
    'medium': 'bg-yellow-500/20 text-yellow-400',
    'bold': 'bg-orange-500/20 text-orange-400',
    'very-strong': 'bg-red-500/20 text-red-400'
  }[wood.intensity];

  const commonMistakes = {
    'light': "Over-smoking (thinking it's too subtle). Trust the process.",
    'medium': "Using without understanding pairing. Match to drink style.",
    'bold': "Exceeding time limits. These woods punish over-smoking.",
    'very-strong': "Using with delicate drinks. Reserve for bold spirits only."
  }[wood.intensity];

  const quickFix = {
    'light': "If too subtle, try 2-3 seconds longer (within max).",
    'medium': "Express citrus if it feels heavy. Rest longer if harsh.",
    'bold': "If too intense, shorter time next round. Citrus to rescue.",
    'very-strong': "Start at minimum time. Work up slowly. Citrus mandatory."
  }[wood.intensity];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors" data-testid={`wood-guide-${wood.id}`}>
          <div className="flex items-center gap-3">
            <TreePine className="w-5 h-5 text-orange-500" />
            <span className="font-medium">{wood.name}</span>
            <Badge className={intensityColor}>{wood.intensity}</Badge>
            {wood.methodRestriction === 'garnishOnly' && (
              <Badge variant="outline" className="text-purple-400 border-purple-400/50">Garnish Only</Badge>
            )}
          </div>
          {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 bg-slate-900/50 rounded-b-lg space-y-4 border-x border-b border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Aroma (Nose)</p>
              <p className="text-slate-300">{wood.tastingNotes}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Purpose</p>
              <p className="text-slate-300">{wood.purpose}</p>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Best With</p>
            <div className="flex flex-wrap gap-2">
              {wood.bestWithDrinkTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Food Pairings</p>
            <div className="flex flex-wrap gap-2">
              {wood.bestWithFoodTags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-700">
            <div>
              <p className="text-xs text-orange-500 uppercase tracking-wide mb-1">Common Mistake</p>
              <p className="text-sm text-slate-400">{commonMistakes}</p>
            </div>
            <div>
              <p className="text-xs text-green-500 uppercase tracking-wide mb-1">Quick Fix</p>
              <p className="text-sm text-slate-400">{quickFix}</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded p-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Try This</p>
            <p className="text-sm text-slate-300">
              {wood.intensity === 'light' && "Light spritz or gin-based drink. Let the elegance shine."}
              {wood.intensity === 'medium' && "Classic Old Fashioned or Negroni. Balanced and approachable."}
              {wood.intensity === 'bold' && "Spirit-forward whiskey drinks. Keep it simple, let wood speak."}
              {wood.intensity === 'very-strong' && "Mezcal-based cocktails only. Match intensity to intensity."}
            </p>
            <p className="text-xs text-slate-500 mt-1">Time range: {wood.timeMin}-{wood.timeMax}s</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Education() {
  const { woodLibrary, userSettings } = useStore();
  const enabledWoods = woodLibrary.filter(w => w.isInMyKit);
  const allWoods = woodLibrary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-orange-500">Education</h1>
        <p className="text-slate-400 mt-1">Master the art of smoked cocktails</p>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-900" data-testid="education-tabs">
          <TabsTrigger value="basics" data-testid="tab-basics">Basics</TabsTrigger>
          <TabsTrigger value="woods" data-testid="tab-woods">Woods</TabsTrigger>
          <TabsTrigger value="sensory" data-testid="tab-sensory">Checklist</TabsTrigger>
          <TabsTrigger value="fixit" data-testid="tab-fixit">Fix It</TabsTrigger>
          <TabsTrigger value="experiments" data-testid="tab-experiments">Flights</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-6 mt-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-500">
                <Flame className="w-5 h-5" />
                Smoke Basics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-300 leading-relaxed">{SMOKE_BASICS.intro}</p>
              
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wide">Key Principles</h3>
                <div className="space-y-3">
                  {SMOKE_BASICS.keyPrinciples.map((p, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-200">{p.title}</p>
                        <p className="text-sm text-slate-400">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wide">How Smoke Interacts With...</h3>
                <div className="grid gap-3">
                  {SMOKE_BASICS.interactions.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                        {item.element === 'Sweetness' && <Droplets className="w-4 h-4 text-orange-400" />}
                        {item.element === 'Acidity' && <ThermometerSun className="w-4 h-4 text-yellow-400" />}
                        {item.element === 'Bitterness' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                        {item.element === 'Dilution' && <Timer className="w-4 h-4 text-blue-400" />}
                        {item.element === 'Spirit-forward' && <Wind className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{item.element}</p>
                        <p className="text-sm text-slate-400">{item.effect}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Safety Guardrails
                </h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <ul className="space-y-2">
                    {SMOKE_BASICS.guardrails.map((rule, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-red-400">•</span> {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {userSettings.smokerType && (
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wide">Your Device: {userSettings.smokerType === 'chimney' ? 'Chimney / Top-Mounted' : userSettings.smokerType}</h3>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-300">
                    {userSettings.smokerType === 'chimney' && (
                      <ul className="space-y-2">
                        <li>• Use small pinch of wood chips—avoid overpacking</li>
                        <li>• Torch for steady smoke flow, not roaring flame</li>
                        <li>• Capture smoke in glass, rest 20-30s, then pour</li>
                        <li>• Clean chamber regularly to avoid stale notes</li>
                      </ul>
                    )}
                    {userSettings.smokerType === 'cloche' && (
                      <ul className="space-y-2">
                        <li>• Ignite wood on tray/board, trap smoke under dome</li>
                        <li>• Timer + rest—small volume saturates quickly</li>
                        <li>• Avoid long capture times</li>
                      </ul>
                    )}
                    {userSettings.smokerType === 'smoking-gun' && (
                      <ul className="space-y-2">
                        <li>• Direct infusion—control flow with tube placement</li>
                        <li>• Shorter times than chimney (smoke is more concentrated)</li>
                        <li>• Good for quick infusions and travel</li>
                      </ul>
                    )}
                    {userSettings.smokerType === 'torch-only' && (
                      <ul className="space-y-2">
                        <li>• Place chips in heatproof container</li>
                        <li>• Brief torch, capture smoke in inverted glass</li>
                        <li>• More variable—practice makes perfect</li>
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="woods" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Wood Flavor Guide</h2>
            <Badge variant="outline">{enabledWoods.length} in your kit</Badge>
          </div>
          
          <p className="text-sm text-slate-400">Click any wood to see detailed tasting notes, pairings, and tips.</p>
          
          <div className="space-y-2">
            {allWoods.map(wood => (
              <WoodFlavorGuide key={wood.id} wood={wood} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sensory" className="space-y-6 mt-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" />
                Sensory Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-400">Use this checklist when tasting your smoked cocktails to identify what's working and what needs adjustment.</p>
              
              <div>
                <h3 className="flex items-center gap-2 text-green-400 font-semibold mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  Green Flags (What You Want)
                </h3>
                <div className="space-y-2">
                  {SENSORY_CHECKLIST.greenFlags.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <Badge className="bg-green-500/20 text-green-400">{item.sense}</Badge>
                      <span className="text-slate-300 text-sm">{item.sign}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-red-400 font-semibold mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  Red Flags (Warning Signs)
                </h3>
                <div className="space-y-2">
                  {SENSORY_CHECKLIST.redFlags.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <Badge className="bg-red-500/20 text-red-400">{item.sense}</Badge>
                      <span className="text-slate-300 text-sm">{item.sign}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixit" className="space-y-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-200">Fix It Guide</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">Something off with your smoked drink? Find the problem and apply a fix.</p>
          
          <div className="space-y-4">
            {FIX_IT_PROBLEMS.map(problem => (
              <Card key={problem.id} className="bg-slate-900 border-slate-800" data-testid={`fix-${problem.id}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    {problem.problem}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Why It Happens</p>
                    <p className="text-sm text-slate-400">{problem.why}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-green-500 uppercase tracking-wide mb-2">How to Fix</p>
                    <ul className="space-y-1">
                      {problem.fixes.map((fix, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <p className="text-xs text-orange-400 uppercase tracking-wide mb-1">Garnish Fix</p>
                    <p className="text-sm text-slate-300">{problem.garnishFix}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-200">Guided Experiments</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">Mini tasting flights to develop your palate and find your preferences.</p>

          <div className="space-y-4">
            {GUIDED_EXPERIMENTS.map(exp => (
              <Card key={exp.id} className="bg-slate-900 border-slate-800" data-testid={`experiment-${exp.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{exp.name}</CardTitle>
                    <Badge variant={exp.difficulty === 'Beginner' ? 'secondary' : 'outline'}>
                      {exp.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-400">{exp.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Base Drink</p>
                      <p className="text-sm text-slate-300">{exp.baseDrink}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Woods</p>
                      <div className="flex flex-wrap gap-1">
                        {exp.woods.map(w => (
                          <Badge key={w} variant="secondary" className="text-xs">{w}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Setup</p>
                    <p className="text-sm text-slate-300">{exp.setup}</p>
                  </div>

                  {exp.warning && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <p className="text-sm text-red-300">{exp.warning}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-orange-500 uppercase tracking-wide mb-2">What to Notice</p>
                    <ul className="space-y-1">
                      {exp.whatToNotice.map((note, i) => (
                        <li key={i} className="text-sm text-slate-400">• {note}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
