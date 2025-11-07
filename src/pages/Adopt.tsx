import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/ui/navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import petFluff from "@/assets/pet-fluff.png";
import petSpark from "@/assets/pet-spark.png";
import petAqua from "@/assets/pet-aqua.png";
import petTerra from "@/assets/pet-terra.png";
import petCloud from "@/assets/pet-cloud.png";

const species = [
  { id: "fluff", name: "Fluff", image: petFluff, description: "A fluffy, loving companion", element: "light" },
  { id: "spark", name: "Spark", image: petSpark, description: "Magical and full of energy", element: "fire" },
  { id: "aqua", name: "Aqua", image: petAqua, description: "Calm and peaceful water friend", element: "water" },
  { id: "terra", name: "Terra", image: petTerra, description: "Strong and dependable", element: "earth" },
  { id: "cloud", name: "Cloud", image: petCloud, description: "Light and dreamy", element: "air" },
];

const Adopt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [petName, setPetName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedSpecies || !petName) return;

    setLoading(true);
    try {
      const selectedSpec = species.find(s => s.id === selectedSpecies);
      const { error } = await supabase.from("pets").insert([
        {
          owner_id: user.id,
          name: petName,
          species: selectedSpecies,
          element: selectedSpec?.element || 'normal',
          hunger: 50,
          happiness: 50,
          health: 100,
          energy: 100,
        },
      ]);

      if (error) throw error;

      toast.success(`${petName} has joined your family!`);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to adopt pet");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient mb-4">Adopt a Pet</h1>
            <p className="text-lg text-muted-foreground">
              Choose your new companion and give them a name
            </p>
          </div>

          <form onSubmit={handleAdopt} className="space-y-8">
            {/* Species Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-bold">Select a Species</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {species.map((spec) => (
                  <Card
                    key={spec.id}
                    className={`p-4 cursor-pointer transition-smooth hover:shadow-lg ${
                      selectedSpecies === spec.id
                        ? "ring-2 ring-primary shadow-button"
                        : ""
                    }`}
                    onClick={() => setSelectedSpecies(spec.id)}
                  >
                    <img
                      src={spec.image}
                      alt={spec.name}
                      className="w-full h-32 object-contain mb-2"
                    />
                    <h3 className="font-bold text-center mb-1">{spec.name}</h3>
                    <p className="text-xs text-primary/80 text-center font-semibold mb-1">
                      {spec.element.charAt(0).toUpperCase() + spec.element.slice(1)} Element
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {spec.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pet Name */}
            <div className="space-y-2">
              <Label htmlFor="petName" className="text-lg font-bold">
                Name Your Pet
              </Label>
              <Input
                id="petName"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Enter a name..."
                required
                maxLength={20}
                className="text-lg"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedSpecies || !petName || loading}
                className="flex-1 shadow-button"
              >
                {loading ? "Adopting..." : "Adopt Pet"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Adopt;
