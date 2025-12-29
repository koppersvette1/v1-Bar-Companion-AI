import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "@/components/layout";
import NotFound from "@/pages/not-found";

// Pages (I will create these next)
import Home from "@/pages/home";
import Inventory from "@/pages/inventory";
import Cocktails from "@/pages/cocktails";
import Smoker from "@/pages/smoker";
import People from "@/pages/people";
import Settings from "@/pages/settings";
import Favorites from "@/pages/favorites";
import Pair from "@/pages/pair";

function Router() {
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
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
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
