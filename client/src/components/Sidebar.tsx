import { Link, useLocation } from "wouter";
import { LayoutDashboard, ArrowLeftRight, History, LogOut, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/swap", label: "Swap", icon: ArrowLeftRight },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 min-h-screen bg-card border-r border-border p-6 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Wallet className="text-primary-foreground w-6 h-6" />
        </div>
        <span className="font-display font-bold text-2xl text-foreground tracking-tight">
          DeFi<span className="text-primary">Agg</span>
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="mt-auto pt-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-border"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground">{user.firstName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
