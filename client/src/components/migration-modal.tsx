import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, History, BookHeart, Beaker, Loader2 } from "lucide-react";
import { useMigrateGuestData } from "@/hooks/use-migrate-guest-data";
import { useGuestStore } from "@/lib/guest-store";

interface MigrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MigrationModal({ open, onOpenChange }: MigrationModalProps) {
  const { migrateData, skipMigration, isMigrating } = useMigrateGuestData();
  const guestStore = useGuestStore();
  const data = guestStore.getExportData();

  const handleMigrate = async () => {
    await migrateData();
    onOpenChange(false);
  };

  const handleSkip = () => {
    skipMigration();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-white flex items-center gap-2">
            <Upload className="h-6 w-6 text-orange-500" />
            Import Your Guest Data?
          </DialogTitle>
          <DialogDescription className="text-slate-400 pt-2">
            We found data from your guest session. Would you like to save it to your account?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {data.pendingFavorites.length > 0 && (
            <div className="flex items-center gap-3 text-slate-300">
              <BookHeart className="h-5 w-5 text-orange-500" />
              <span>{data.pendingFavorites.length} pending favorite{data.pendingFavorites.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          {data.flights.length > 0 && (
            <div className="flex items-center gap-3 text-slate-300">
              <Beaker className="h-5 w-5 text-orange-500" />
              <span>{data.flights.length} flight{data.flights.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          {data.recentDrinks.length > 0 && (
            <div className="flex items-center gap-3 text-slate-300">
              <History className="h-5 w-5 text-orange-500" />
              <span>{data.recentDrinks.length} drink{data.recentDrinks.length !== 1 ? 's' : ''} in history</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button 
            onClick={handleMigrate}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isMigrating}
            data-testid="button-migrate-data"
          >
            {isMigrating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              "Import to My Account"
            )}
          </Button>
          <Button 
            onClick={handleSkip}
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-300"
            disabled={isMigrating}
            data-testid="button-skip-migration"
          >
            Skip for Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
