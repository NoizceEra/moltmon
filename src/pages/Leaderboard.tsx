import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeaderboardEntry {
  id: string;
  username: string;
  value: number;
  rank: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pointsLeaderboard, setPointsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [levelLeaderboard, setLevelLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [petsLeaderboard, setPetsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchLeaderboards = async () => {
      // Points Leaderboard
      const { data: pointsData } = await supabase
        .from("profiles")
        .select("id, username, pet_points")
        .order("pet_points", { ascending: false })
        .limit(10);

      if (pointsData) {
        setPointsLeaderboard(
          pointsData.map((entry, index) => ({
            id: entry.id,
            username: entry.username,
            value: entry.pet_points || 0,
            rank: index + 1,
          }))
        );
      }

      // Highest Level Pet Leaderboard
      const { data: petsData } = await supabase
        .from("pets")
        .select("owner_id, level")
        .order("level", { ascending: false })
        .limit(100);

      if (petsData) {
        // Group by owner and get max level
        const ownerMaxLevels = new Map<string, number>();
        petsData.forEach((pet) => {
          const currentMax = ownerMaxLevels.get(pet.owner_id) || 0;
          ownerMaxLevels.set(pet.owner_id, Math.max(currentMax, pet.level || 1));
        });

        // Get profiles for these owners
        const ownerIds = Array.from(ownerMaxLevels.keys());
        const { data: ownersData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", ownerIds);

        if (ownersData) {
          const levelEntries = ownersData
            .map((owner) => ({
              id: owner.id,
              username: owner.username,
              value: ownerMaxLevels.get(owner.id) || 1,
              rank: 0,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));

          setLevelLeaderboard(levelEntries);
        }
      }

      // Most Pets Leaderboard
      const { data: allPets } = await supabase
        .from("pets")
        .select("owner_id");

      if (allPets) {
        const petCounts = new Map<string, number>();
        allPets.forEach((pet) => {
          petCounts.set(pet.owner_id, (petCounts.get(pet.owner_id) || 0) + 1);
        });

        const ownerIds = Array.from(petCounts.keys());
        const { data: ownersData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", ownerIds);

        if (ownersData) {
          const petsEntries = ownersData
            .map((owner) => ({
              id: owner.id,
              username: owner.username,
              value: petCounts.get(owner.id) || 0,
              rank: 0,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));

          setPetsLeaderboard(petsEntries);
        }
      }

      setLoading(false);
    };

    fetchLeaderboards();
  }, [user, navigate]);

  const LeaderboardTable = ({
    entries,
    valueLabel,
    icon: Icon,
  }: {
    entries: LeaderboardEntry[];
    valueLabel: string;
    icon: any;
  }) => (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`flex items-center justify-between p-4 rounded-lg border ${
            entry.id === user?.id ? "bg-primary/5 border-primary" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8">
              {entry.rank <= 3 ? (
                <Trophy
                  className={`w-6 h-6 ${
                    entry.rank === 1
                      ? "text-yellow-500"
                      : entry.rank === 2
                      ? "text-gray-400"
                      : "text-amber-600"
                  }`}
                />
              ) : (
                <span className="font-bold text-muted-foreground">#{entry.rank}</span>
              )}
            </div>
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {entry.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{entry.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold">{entry.value}</span>
            <span className="text-sm text-muted-foreground">{valueLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Leaderboard</h1>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="points" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="points">
                <Star className="w-4 h-4 mr-2" />
                PetPoints
              </TabsTrigger>
              <TabsTrigger value="levels">
                <Trophy className="w-4 h-4 mr-2" />
                Highest Level
              </TabsTrigger>
              <TabsTrigger value="collection">
                <Heart className="w-4 h-4 mr-2" />
                Most Pets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="points" className="mt-6">
              <LeaderboardTable
                entries={pointsLeaderboard}
                valueLabel="PP"
                icon={Star}
              />
            </TabsContent>

            <TabsContent value="levels" className="mt-6">
              <LeaderboardTable
                entries={levelLeaderboard}
                valueLabel="Level"
                icon={Trophy}
              />
            </TabsContent>

            <TabsContent value="collection" className="mt-6">
              <LeaderboardTable
                entries={petsLeaderboard}
                valueLabel="Pets"
                icon={Heart}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
