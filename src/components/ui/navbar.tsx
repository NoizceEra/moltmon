import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { Sparkles, Store, LogOut, User, Users, Trophy, MessageCircle, Swords, Menu, Settings } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { to: "/dashboard", icon: User, label: "My Pets" },
    { to: "/shop", icon: Store, label: "Shop" },
    { to: "/community", icon: Users, label: "Community" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/chat", icon: MessageCircle, label: "Chat" },
    { to: "/battle", icon: Swords, label: "Battle" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-gradient hidden sm:inline">Critter Caretakers</span>
          <span className="text-gradient sm:hidden">CC</span>
        </Link>

        {user && (
          <>
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to}>
                  <Button
                    variant={location.pathname === to ? "default" : "ghost"}
                    size="sm"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              ))}
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Mobile Navigation */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map(({ to, icon: Icon, label }) => (
                    <Link key={to} to={to} onClick={() => setOpen(false)}>
                      <Button
                        variant={location.pathname === to ? "default" : "ghost"}
                        className="w-full justify-start"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {label}
                      </Button>
                    </Link>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </nav>
  );
};
