import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import petFluff from "@/assets/pet-fluff.png";
import petSpark from "@/assets/pet-spark.png";
import petAqua from "@/assets/pet-aqua.png";
import petTerra from "@/assets/pet-terra.png";
import petCloud from "@/assets/pet-cloud.png";

const petImages: Record<string, string> = {
  fluff: petFluff,
  spark: petSpark,
  aqua: petAqua,
  terra: petTerra,
  cloud: petCloud,
};

interface Profile {
  id: string;
  username: string;
  pet_points: number;
  pets: Array<{
    id: string;
    name: string;
    species: string;
    level: number;
    color: string;
  }>;
}

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfiles = async () => {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          pet_points
        `)
        .order("pet_points", { ascending: false })
        .limit(20);

      if (!profilesData) {
        setLoading(false);
        return;
      }

      // Fetch pets for each profile
      const profilesWithPets = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: petsData } = await supabase
            .from("pets")
            .select("id, name, species, level, color")
            .eq("owner_id", profile.id);

          return {
            ...profile,
            pets: petsData || [],
          };
        })
      );

      setProfiles(profilesWithPets);
      setLoading(false);
    };

    fetchProfiles();
  }, [user, navigate]);

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
          <Users className="w-8 h-8" />
          <h1 className="text-4xl font-bold">Community</h1>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{profile.username}</h3>
                  <Badge variant="secondary">{profile.pet_points} PP</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Pets ({profile.pets.length})
                </p>
                {profile.pets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pets yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {profile.pets.slice(0, 4).map((pet) => (
                      <div
                        key={pet.id}
                        className="border rounded-lg p-2 text-center"
                      >
                        <div
                          className="w-16 h-16 mx-auto rounded-lg mb-2 flex items-center justify-center"
                          style={{ backgroundColor: pet.color }}
                        >
                          <img
                            src={petImages[pet.species]}
                            alt={pet.name}
                            className="w-12 h-12 object-contain"
                          />
                        </div>
                        <p className="text-xs font-medium truncate">{pet.name}</p>
                        <p className="text-xs text-muted-foreground">Lvl {pet.level}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
