import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, User, BookHeart, FlaskConical } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export default function UpgradeModal({ open, onOpenChange, feature }: UpgradeModalProps) {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-white flex items-center gap-2">
            <Star className="h-6 w-6 text-orange-500" />
            Save to Your BarBuddy?
          </DialogTitle>
          <DialogDescription className="text-slate-400 pt-2">
            Create a free account to save your favorites, people profiles, bar inventory, and drink history.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="flex items-center gap-3 text-slate-300">
            <BookHeart className="h-5 w-5 text-orange-500" />
            <span>Save favorite recipes</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <User className="h-5 w-5 text-orange-500" />
            <span>Create guest profiles with taste preferences</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <FlaskConical className="h-5 w-5 text-orange-500" />
            <span>Track your bar inventory</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button 
            onClick={handleSignIn}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            data-testid="button-create-account"
          >
            Create Account
          </Button>
          <Button 
            onClick={handleSignIn}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
            data-testid="button-sign-in"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-300"
            data-testid="button-continue-guest"
          >
            Continue as Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
