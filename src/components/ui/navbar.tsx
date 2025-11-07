import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "./button";
import { Sparkles, Store, LogOut, User, Users, Trophy, MessageCircle, Swords } from "lucide-react";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-gradient">Critter Caretakers</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button
                variant={location.pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
              >
                <User className="w-4 h-4 mr-2" />
                My Pets
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                variant={location.pathname === "/shop" ? "default" : "ghost"}
                size="sm"
              >
                <Store className="w-4 h-4 mr-2" />
                Shop
              </Button>
            </Link>
            <Link to="/community">
              <Button
                variant={location.pathname === "/community" ? "default" : "ghost"}
                size="sm"
              >
                <Users className="w-4 h-4 mr-2" />
                Community
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button
                variant={location.pathname === "/leaderboard" ? "default" : "ghost"}
                size="sm"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </Link>
            <Link to="/chat">
              <Button
                variant={location.pathname === "/chat" ? "default" : "ghost"}
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </Link>
            <Link to="/battle">
              <Button
                variant={location.pathname === "/battle" ? "default" : "ghost"}
                size="sm"
              >
                <Swords className="w-4 h-4 mr-2" />
                Battle
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
