import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/ui/navbar";
import { Badge } from "@/components/ui/badge";
import { Coins, ShoppingCart } from "lucide-react";

interface MarketplaceListing {
  id: string;
  pet_id: string;
  price: number;
  seller_id: string;
  seller_username?: string;
  pets: {
    name: string;
    species: string;
    level: number;
    element: string;
    health: number;
  };
}

const Marketplace = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch listings
    const { data: listingsData, error: listingsError } = await supabase
      .from("marketplace_listings")
      .select(`
        *,
        pets (name, species, level, element, health)
      `)
      .eq("status", "active")
      .order("listed_at", { ascending: false });

    if (listingsError) {
      toast({
        title: "Error loading marketplace",
        description: listingsError.message,
        variant: "destructive",
      });
    } else if (listingsData) {
      // Fetch seller usernames separately
      const sellerIds = [...new Set(listingsData.map(l => l.seller_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", sellerIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p.username]));
      
      const enrichedListings = listingsData.map(listing => ({
        ...listing,
        seller_username: profilesMap.get(listing.seller_id) || "Unknown"
      }));

      setListings(enrichedListings);
    }

    // Fetch user points
    const { data: profileData } = await supabase
      .from("profiles")
      .select("pet_points")
      .eq("id", user!.id)
      .single();

    if (profileData) {
      setUserPoints(profileData.pet_points);
    }

    setLoading(false);
  };

  const handlePurchase = async (listingId: string, price: number) => {
    if (price > userPoints) {
      toast({
        title: "Insufficient PetPoints",
        description: "You don't have enough PetPoints for this purchase.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.rpc("purchase_marketplace_pet", {
        p_listing_id: listingId,
        p_buyer_id: user!.id,
      });

      if (error) throw error;

      toast({
        title: "Purchase successful!",
        description: "The pet has been added to your collection.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-6 pt-24">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
            <p className="text-muted-foreground">Buy and sell pets with other players</p>
          </div>
          <div className="flex items-center gap-2 bg-card p-4 rounded-lg border">
            <Coins className="w-5 h-5 text-primary" />
            <span className="text-xl font-semibold">{userPoints}</span>
            <span className="text-sm text-muted-foreground">PetPoints</span>
          </div>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : listings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">No pets listed for sale</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card key={listing.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{listing.pets.name}</CardTitle>
                          <CardDescription>
                            {listing.pets.species} • Level {listing.pets.level}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{listing.pets.element}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Health</span>
                          <span className="font-medium">{listing.pets.health}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Seller</span>
                          <span className="font-medium">{listing.seller_username}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold">{listing.price}</span>
                      </div>
                      <Button
                        onClick={() => handlePurchase(listing.id, listing.price)}
                        disabled={listing.seller_id === user.id}
                      >
                        {listing.seller_id === user.id ? "Your Pet" : "Buy Now"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-listings">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Listing functionality coming soon! Visit your pet's detail page to list it for sale.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Marketplace;
