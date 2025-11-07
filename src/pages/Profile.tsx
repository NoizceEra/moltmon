import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trophy, Sparkles, Users, ArrowLeft } from "lucide-react";
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

interface Pet {
  id: string;
  name: string;
  species: string;
  level: number;
  color: string;
}

interface Profile {
  id: string;
  username: string;
  pet_points: number;
  created_at: string;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        toast.error("User not found");
        navigate("/community");
        return;
      }

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's pets
        const { data: petsData, error: petsError } = await supabase
          .from("pets")
          .select("id, name, species, level, color")
          .eq("owner_id", userId)
          .order("level", { ascending: false });

        if (petsError) throw petsError;
        setPets(petsData || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load profile");
        navigate("/community");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Profile not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const totalLevels = pets.reduce((sum, pet) => sum + pet.level, 0);
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="p-8 mb-8 gradient-card">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-primary-foreground">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gradient">{profile.username}</h1>
                {isOwnProfile && (
                  <Badge variant="secondary" className="text-xs">
                    Your Profile
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">
                Member since {memberSince}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full">
                  <Trophy className="w-5 h-5 text-accent" />
                  <span className="font-bold">{profile.pet_points} PetPoints</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-bold">{pets.length} Pets</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-full">
                  <Users className="w-5 h-5 text-secondary" />
                  <span className="font-bold">Level {totalLevels}</span>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <Link to="/settings">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Pets Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {isOwnProfile ? "Your Pets" : `${profile.username}'s Pets`}
          </h2>
          {pets.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {isOwnProfile ? "You don't have any pets yet." : "This user hasn't adopted any pets yet."}
              </p>
              {isOwnProfile && (
                <Link to="/adopt" className="inline-block mt-4">
                  <Button>Adopt Your First Pet</Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pets.map((pet) => (
                <Link key={pet.id} to={`/pet/${pet.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-smooth cursor-pointer gradient-card">
                    <div className="flex flex-col items-center">
                      <img
                        src={petImages[pet.species]}
                        alt={pet.name}
                        className="w-24 h-24 object-contain mb-4"
                      />
                      <h3 className="text-lg font-bold mb-1">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize mb-2">
                        {pet.species}
                      </p>
                      <Badge variant="secondary">Level {pet.level}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
