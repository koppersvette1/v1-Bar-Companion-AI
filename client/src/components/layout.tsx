import { Link, useLocation } from "wouter";
import { Home, Library, Martini, Flame, Users, BookHeart, Settings, GraduationCap, Beaker, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/inventory", icon: Library, label: "My Bar" },
    { href: "/cocktails", icon: Martini, label: "Drinks" },
    { href: "/smoker", icon: Flame, label: "Smoker" },
    { href: "/flights", icon: Beaker, label: "Flights" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white pb-20 md:pb-0">
      
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between md:hidden">
        <Link href="/" className="text-xl font-serif font-bold tracking-tight text-orange-500 flex items-center gap-2">
          <Flame className="w-5 h-5 fill-orange-500/20" />
          BarBuddy
        </Link>
        <div className="flex items-center gap-2">
          {!user && (
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-mobile-sign-in"
            >
              Sign In
            </Button>
          )}
          <Link href="/settings" className="p-2 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
          </Link>
        </div>
      </header>

      {/* Desktop Sidebar / Mobile Content Wrapper */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col gap-6 p-6 sticky top-0 h-screen border-r border-slate-800 bg-slate-950/50">
          <div className="mb-2">
            <Link href="/" className="text-2xl font-serif font-bold text-orange-500 tracking-tight flex items-center gap-2">
              <Flame className="w-7 h-7 fill-orange-500/20" />
              BarBuddy
            </Link>
            <p className="text-xs text-slate-500 mt-1 ml-9">Hybrid Intelligence</p>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm",
                  location === item.href 
                    ? "bg-orange-500/10 text-orange-500 shadow-sm ring-1 ring-orange-500/20" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                )}
              >
                <item.icon className={cn("w-4 h-4 transition-colors", location === item.href ? "text-orange-500" : "text-slate-500 group-hover:text-slate-300")} />
                {item.label}
              </Link>
            ))}
            
            <div className="my-2 border-t border-slate-800" />
            
            <Link 
              href="/people"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm",
                location === "/people" 
                  ? "bg-orange-500/10 text-orange-500" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              )}
            >
              <Users className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              People
            </Link>
            <Link 
              href="/favorites"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm",
                location === "/favorites" 
                  ? "bg-orange-500/10 text-orange-500" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              )}
            >
              <BookHeart className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              Favorites
            </Link>
            <Link 
              href="/education"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm",
                location === "/education" 
                  ? "bg-orange-500/10 text-orange-500" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              )}
            >
              <GraduationCap className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              Education
            </Link>
            <Link 
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm",
                location === "/settings" 
                  ? "bg-orange-500/10 text-orange-500" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              )}
            >
              <Settings className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              Settings
            </Link>
          </nav>
          
          <div className="mt-auto pt-4 border-t border-slate-800">
            {user ? (
              <>
                <div className="px-4 py-2 text-sm text-slate-400">
                  {user.name || user.email}
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-900"
                  onClick={() => logout()}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-sign-in"
              >
                Sign In
              </Button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 pb-safe md:hidden z-50">
        <div className="flex items-center justify-around p-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px]",
                location === item.href 
                  ? "text-orange-500" 
                  : "text-slate-500 active:text-slate-300"
              )}
            >
              <item.icon className={cn("w-6 h-6", location === item.href && "fill-current/20")} strokeWidth={location === item.href ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
