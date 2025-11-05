import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";
import { Progress } from "@/components/ui/progress";
import { UtensilsCrossed, Gamepad2, Sparkles, Moon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
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
  hunger: number;
  happiness: number;
  health: number;
  energy: number;
  experience: number;
}

const PetDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) {
      navigate("/dashboard");
      return;
    }

    const fetchPet = async () => {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", id)
        .eq("owner_id", user.id)
        .single();

      if (error || !data) {
        toast.error("Pet not found");
        navigate("/dashboard");
        return;
      }

      setPet(data);
      setLoading(false);
    };

    fetchPet();
  }, [id, user, navigate]);

  const handleAction = async (
    action: "feed" | "play" | "groom" | "rest",
    stat: keyof Pet,
    change: number,
    cost: number = 0
  ) => {
    if (!pet) return;

    const newValue = Math.min(100, Math.max(0, pet[stat] as number + change));
    const updates: any = { [stat]: newValue };

    // Add experience
    updates.experience = pet.experience + 10;
    if (updates.experience >= 100 * pet.level) {
      updates.level = pet.level + 1;
      updates.experience = 0;
      toast.success(`${pet.name} leveled up to ${pet.level + 1}!`);
    }

    const { error } = await supabase.from("pets").update(updates).eq("id", pet.id);

    if (error) {
      toast.error("Action failed");
      return;
    }

    // Update profile points if cost
    if (cost > 0 && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("pet_points")
        .eq("id", user.id)
        .single();

      if (profile && profile.pet_points >= cost) {
        await supabase
          .from("profiles")
          .update({ pet_points: profile.pet_points - cost })
          .eq("id", user.id);
      } else {
        toast.error("Not enough PetPoints!");
        return;
      }
    }

    setPet({ ...pet, ...updates });
    toast.success(`${pet.name} enjoyed that!`);
  };

  if (loading || !pet) {
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
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pet Display */}
          <Card className="p-8 gradient-card shadow-card">
            <div className="text-center">
              <img
                src={petImages[pet.species]}
                alt={pet.name}
                className="w-64 h-64 mx-auto object-contain mb-6"
              />
              <h1 className="text-4xl font-bold mb-2">{pet.name}</h1>
              <p className="text-lg text-muted-foreground capitalize mb-4">
                {pet.species} • Level {pet.level}
              </p>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Experience</div>
                <Progress value={(pet.experience / (100 * pet.level)) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {pet.experience} / {100 * pet.level} XP
                </div>
              </div>
            </div>
          </Card>

          {/* Stats & Actions */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Stats</h2>
              <div className="space-y-4">
                <StatDisplay label="Hunger" value={pet.hunger} color="stat-hunger" />
                <StatDisplay label="Happiness" value={pet.happiness} color="stat-happiness" />
                <StatDisplay label="Health" value={pet.health} color="stat-health" />
                <StatDisplay label="Energy" value={pet.energy} color="stat-energy" />
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleAction("feed", "hunger", -20, 10)}
                  disabled={pet.hunger <= 20}
                  className="h-20 flex-col gap-2"
                >
                  <UtensilsCrossed className="w-6 h-6" />
                  <span>Feed (10 PP)</span>
                </Button>
                <Button
                  onClick={() => handleAction("play", "happiness", 15, 5)}
                  disabled={pet.energy <= 20}
                  className="h-20 flex-col gap-2"
                >
                  <Gamepad2 className="w-6 h-6" />
                  <span>Play (5 PP)</span>
                </Button>
                <Button
                  onClick={() => handleAction("groom", "health", 10, 8)}
                  disabled={pet.health >= 90}
                  className="h-20 flex-col gap-2"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Groom (8 PP)</span>
                </Button>
                <Button
                  onClick={() => handleAction("rest", "energy", 25, 0)}
                  disabled={pet.energy >= 75}
                  className="h-20 flex-col gap-2"
                >
                  <Moon className="w-6 h-6" />
                  <span>Rest (Free)</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Each action earns 10 XP toward the next level!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatDisplay = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: `hsl(var(--${color}))`,
          }}
        />
      </div>
    </div>
  );
};

export default PetDetail;
