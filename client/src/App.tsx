import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Layout from "@/components/layout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";

import Home from "@/pages/home";
import Inventory from "@/pages/inventory";
import Cocktails from "@/pages/cocktails";
import Smoker from "@/pages/smoker";
import People from "@/pages/people";
import Settings from "@/pages/settings";
import Favorites from "@/pages/favorites";
import Pair from "@/pages/pair";
import Education from "@/pages/education";
import Flights from "@/pages/flights";

function AuthenticatedRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/cocktails" component={Cocktails} />
        <Route path="/smoker" component={Smoker} />
        <Route path="/people" component={People} />
        <Route path="/settings" component={Settings} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/pair" component={Pair} />
        <Route path="/education" component={Education} />
        <Route path="/flights" component={Flights} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <AuthenticatedRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
