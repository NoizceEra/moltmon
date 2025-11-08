import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { trackQuestProgress } from "@/lib/questTracker";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  effect_type: string | null;
  effect_value: number | null;
}

interface Profile {
  pet_points: number;
}

const Shop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch shop items
        const { data: itemsData, error: itemsError } = await supabase
          .from("shop_items")
          .select("*");

        if (itemsError) throw itemsError;
        setItems(itemsData || []);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("pet_points")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        setProfile(profileData);
      } catch (error: any) {
        toast.error(error.message || "Failed to load shop");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handlePurchase = async (item: ShopItem) => {
    if (!user || !profile) return;

    try {
      // Use atomic RPC function to prevent race conditions
      const { error } = await supabase.rpc('purchase_shop_item', {
        p_user_id: user.id,
        p_item_id: item.id,
        p_item_price: item.price
      });

      if (error) throw error;

      // Track quest progress for shop purchases
      await trackQuestProgress(user.id, 'challenge', 1);

      setProfile({ pet_points: profile.pet_points - item.price });
      toast.success(`Purchased ${item.name}!`);
    } catch (error: any) {
      toast.error(error.message || "Purchase failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading shop...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Pet Shop</h1>
            <p className="text-muted-foreground">Buy items for your pets</p>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-accent/20 rounded-full">
            <Coins className="w-6 h-6 text-accent" />
            <span className="font-bold text-lg">{profile?.pet_points || 0} PetPoints</span>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all">All Items</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <ItemGrid items={items} onPurchase={handlePurchase} />
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <ItemGrid
                items={items.filter((item) => item.category === category)}
                onPurchase={handlePurchase}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

const ItemGrid = ({
  items,
  onPurchase,
}: {
  items: ShopItem[];
  onPurchase: (item: ShopItem) => void;
}) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="p-6 gradient-card shadow-card hover:shadow-lg transition-smooth">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="w-full h-32 bg-muted/50 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              {item.effect_type && (
                <p className="text-xs text-primary font-medium capitalize">
                  {item.effect_type.replace(/_/g, ' ')} {item.effect_value > 0 ? "+" : ""}
                  {item.effect_value}{item.effect_type.includes('boost') ? '%' : ''}
                </p>
              )}
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => onPurchase(item)}
                className="w-full shadow-button"
              >
                <Coins className="w-4 h-4 mr-2" />
                {item.price} PP
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Shop;
