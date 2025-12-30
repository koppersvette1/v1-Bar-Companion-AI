import { useState, useCallback } from "react";
import { useGuestStore, type GuestExportData } from "@/lib/guest-store";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface MigrationResult {
  success: boolean;
  error?: string;
  migratedCounts?: {
    favorites: number;
    flights: number;
    history: number;
  };
}

export function useMigrateGuestData() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const guestStore = useGuestStore();

  const hasDataToMigrate = useCallback(() => {
    const data = guestStore.getExportData();
    return (
      data.recentDrinks.length > 0 ||
      data.flights.length > 0 ||
      data.pendingFavorites.length > 0
    );
  }, [guestStore]);

  const checkForMigration = useCallback(() => {
    if (user && hasDataToMigrate()) {
      setShowMigrationPrompt(true);
    }
  }, [user, hasDataToMigrate]);

  const migrateData = useCallback(async (): Promise<MigrationResult> => {
    if (!user) {
      return { success: false, error: "Not logged in" };
    }

    const exportData = guestStore.getExportData();
    
    if (!exportData.pendingFavorites.length && 
        !exportData.flights.length && 
        !exportData.recentDrinks.length) {
      return { success: true, migratedCounts: { favorites: 0, flights: 0, history: 0 } };
    }

    setIsMigrating(true);

    try {
      const response = await fetch("/api/migrate-guest-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Migration failed");
      }

      const result = await response.json();
      
      guestStore.clearAllData();
      
      toast({
        title: "Data migrated successfully!",
        description: `Transferred ${result.migratedCounts?.favorites || 0} favorites, ${result.migratedCounts?.flights || 0} flights, and ${result.migratedCounts?.history || 0} history entries.`,
      });

      return { success: true, migratedCounts: result.migratedCounts };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Migration failed";
      
      toast({
        title: "Migration failed",
        description: "Your guest data has been kept locally. You can try again later.",
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsMigrating(false);
      setShowMigrationPrompt(false);
    }
  }, [user, guestStore, toast]);

  const skipMigration = useCallback(() => {
    setShowMigrationPrompt(false);
  }, []);

  return {
    isMigrating,
    showMigrationPrompt,
    hasDataToMigrate: hasDataToMigrate(),
    checkForMigration,
    migrateData,
    skipMigration,
  };
}
