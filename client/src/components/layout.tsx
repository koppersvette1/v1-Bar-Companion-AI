import { Link, useLocation } from "wouter";
import { Home, Library, Martini, Flame, Users, BookHeart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/inventory", icon: Library, label: "My Bar" },
    { href: "/cocktails", icon: Martini, label: "Drinks" },
    { href: "/smoker", icon: Flame, label: "Smoker" },
    { href: "/people", icon: Users, label: "People" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans pb-20 md:pb-0 texture-overlay" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 glass-panel px-4 py-3 flex items-center justify-between md:hidden">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #A8884A 100%)' }}>
            <Flame className="w-5 h-5" style={{ color: 'var(--bg)' }} />
          </div>
          <span className="text-xl font-display font-semibold tracking-wider brass-text">
            BarBuddy
          </span>
        </Link>
        <Link href="/settings" className="p-2 rounded-lg hover:bg-[var(--surface2)] transition-colors">
          <Settings className="w-5 h-5" style={{ color: 'var(--muted-text)' }} />
        </Link>
      </header>

      {/* Desktop Sidebar / Mobile Content Wrapper */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col gap-6 p-6 sticky top-0 h-screen border-r" style={{ borderColor: 'var(--border-color)', background: 'var(--surface)' }}>
          <div className="mb-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #A8884A 100%)' }}>
                <Flame className="w-6 h-6" style={{ color: 'var(--bg)' }} />
              </div>
              <div>
                <span className="text-xl font-display font-semibold tracking-wider brass-text block">
                  BarBuddy
                </span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted-text)' }}>Est. 2024</span>
              </div>
            </Link>
          </div>
          
          {/* Deco Divider */}
          <div className="deco-divider text-xs uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            <div className="deco-divider-icon" />
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm",
                  location === item.href 
                    ? "brass-border" 
                    : "hover:bg-[var(--surface2)]"
                )}
                style={{ 
                  color: location === item.href ? 'var(--accent)' : 'var(--muted-text)',
                  background: location === item.href ? 'rgba(198, 161, 91, 0.1)' : 'transparent'
                }}
              >
                <item.icon className="w-4 h-4" style={{ color: location === item.href ? 'var(--accent)' : 'var(--muted-text)' }} />
                {item.label}
              </Link>
            ))}
            
            <div className="my-3 border-t" style={{ borderColor: 'var(--border-color)' }} />
            
            <Link 
              href="/favorites"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm",
                location === "/favorites" ? "brass-border" : "hover:bg-[var(--surface2)]"
              )}
              style={{ 
                color: location === "/favorites" ? 'var(--accent)' : 'var(--muted-text)',
                background: location === "/favorites" ? 'rgba(198, 161, 91, 0.1)' : 'transparent'
              }}
            >
              <BookHeart className="w-4 h-4" />
              Favorites
            </Link>
            <Link 
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm",
                location === "/settings" ? "brass-border" : "hover:bg-[var(--surface2)]"
              )}
              style={{ 
                color: location === "/settings" ? 'var(--accent)' : 'var(--muted-text)',
                background: location === "/settings" ? 'rgba(198, 161, 91, 0.1)' : 'transparent'
              }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 glass-panel pb-safe md:hidden z-50">
        <div className="flex items-center justify-around p-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px]"
              )}
              style={{ color: location === item.href ? 'var(--accent)' : 'var(--muted-text)' }}
            >
              <item.icon 
                className={cn("w-6 h-6", location === item.href && "drop-shadow-[0_0_8px_var(--accent-glow)]")} 
                strokeWidth={location === item.href ? 2.5 : 2} 
              />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              {location === item.href && (
                <div className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
