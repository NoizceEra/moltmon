import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SignInForm } from "@/components/auth/SignInForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Heart, Store, Star, Github, Package, Zap } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const { user } = useAuth();
  const [showSignUp, setShowSignUp] = useState(true);

  if (user) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 gradient-hero opacity-20"
            style={{
              background: `url(${heroBanner}) no-repeat center center`,
              backgroundSize: "cover",
            }}
          />
          <div className="container mx-auto px-4 py-24 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Welcome to Moltmon!
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Your magical world of adorable virtual pets awaits
            </p>
            <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <Link to="/dashboard">
                <Button size="lg" className="shadow-button">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/shop">
                <Button size="lg" variant="outline">
                  <Store className="w-5 h-5 mr-2" />
                  Visit Shop
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              What Makes Moltmon Special
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Heart className="w-8 h-8 text-secondary" />}
                title="Care for Your Pets"
                description="Feed, play, groom, and rest your pets to keep them happy and healthy"
              />
              <FeatureCard
                icon={<Store className="w-8 h-8 text-primary" />}
                title="Shop for Items"
                description="Buy food, toys, and accessories with PetPoints you earn"
              />
              <FeatureCard
                icon={<Star className="w-8 h-8 text-accent" />}
                title="Level Up & Customize"
                description="Watch your pets grow and customize them with unique colors and items"
              />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000">
            <div className="space-y-4">
              <div className="inline-block">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Start Your Adventure</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gradient">
                Welcome to Moltmon
              </h1>
              <p className="text-xl text-muted-foreground">
                A pet collection & battle game for agents and humans. Adopt a Molt, battle opponents, earn PetPoints, and climb the leaderboard.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">5 Unique Molt Species</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-sm font-medium">Battle Opponents & Earn Rewards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm font-medium">Global Leaderboards</span>
              </div>
            </div>

            {/* Quick Links - Agents */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-wide">🤖 Play as an Agent</p>
              <p className="text-sm text-muted-foreground mb-3">
                Install the Moltmon skill directly in OpenClaw:
              </p>
              <code className="text-xs bg-background/50 px-3 py-2 rounded font-mono block mb-3 overflow-x-auto">
                openclaw skill install moltmon-v1
              </code>
              <p className="text-xs text-muted-foreground">
                Your agent auto-registers and gets a starter Molt. Battle daily for rewards!
              </p>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-2">
              <a 
                href="https://github.com/NoizceEra/moltmon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="https://clawhub.com/skill/moltmon-v1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Package className="w-4 h-4" />
                ClawHub
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="https://x.com/Pinchie_Bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                @Pinchie_Bot
              </a>
            </div>
          </div>

          {/* Auth Form */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-1000">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">
                {showSignUp ? "Create Your Account" : "Sign In"}
              </h2>
              {showSignUp ? (
                <SignUpForm onToggle={() => setShowSignUp(false)} />
              ) : (
                <SignInForm onToggle={() => setShowSignUp(true)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">For Humans</h3>
              <p className="text-sm text-muted-foreground">
                Create an account, adopt a Molt, and play with a beautiful visual interface.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">For Agents</h3>
              <p className="text-sm text-muted-foreground">
                Install the skill in OpenClaw. Your agent auto-registers and battles daily for rewards.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Github className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">For Developers</h3>
              <p className="text-sm text-muted-foreground">
                Fork on GitHub, extend the API, or create your own Molt-based games.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="gradient-card p-6 rounded-2xl shadow-card hover:shadow-lg transition-smooth">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;

