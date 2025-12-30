import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "@/components/layout";
import NotFound from "@/pages/not-found";
import MigrationModal from "@/components/migration-modal";
import { useAuth } from "@/hooks/use-auth";
import { useGuestStore } from "@/lib/guest-store";

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

function MigrationCheck() {
  const { user, isLoading } = useAuth();
  const guestStore = useGuestStore();
  const [showMigration, setShowMigration] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !hasChecked) {
      const data = guestStore.getExportData();
      const hasData = data.recentDrinks.length > 0 || 
                      data.flights.length > 0 || 
                      data.pendingFavorites.length > 0;
      if (hasData) {
        setShowMigration(true);
      }
      setHasChecked(true);
    }
  }, [user, isLoading, hasChecked, guestStore]);

  return (
    <MigrationModal 
      open={showMigration} 
      onOpenChange={setShowMigration} 
    />
  );
}

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
        <Route path="/education" component={Education} />
        <Route path="/flights" component={Flights} />
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
        <MigrationCheck />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
