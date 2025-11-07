import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sword, Shield, Zap } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

interface Pet {
  id: string;
  name: string;
  species: string;
  level: number;
  health: number;
  energy: number;
  color: string;
}

interface BattlePet extends Pet {
  currentHealth: number;
  maxHealth: number;
  attack: number;
  defense: number;
}

const Battle = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<BattlePet | null>(null);
  const [opponent, setOpponent] = useState<BattlePet | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [inBattle, setInBattle] = useState(false);
  const [allPets, setAllPets] = useState<Pet[]>([]);

  useEffect(() => {
    if (user) {
      fetchMyPets();
      fetchAllPets();
    }
  }, [user]);

  const fetchMyPets = async () => {
    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", user?.id);
    if (data) setMyPets(data);
  };

  const fetchAllPets = async () => {
    const { data } = await supabase
      .from("pets")
      .select("*")
      .neq("owner_id", user?.id)
      .limit(20);
    if (data) setAllPets(data);
  };

  const calculateStats = (pet: Pet): BattlePet => {
    const maxHealth = 100 + pet.level * 20;
    return {
      ...pet,
      currentHealth: maxHealth,
      maxHealth,
      attack: 10 + pet.level * 3,
      defense: 5 + pet.level * 2,
    };
  };

  const startAIBattle = () => {
    if (!selectedPet) {
      toast({
        title: "Select a Pet",
        description: "Choose a pet to battle with",
        variant: "destructive",
      });
      return;
    }

    const aiPet: BattlePet = calculateStats({
      id: "ai-" + Date.now(),
      name: "Wild " + ["Fluff", "Spark", "Aqua", "Terra", "Cloud"][Math.floor(Math.random() * 5)],
      species: ["fluff", "spark", "aqua", "terra", "cloud"][Math.floor(Math.random() * 5)],
      level: Math.max(1, selectedPet.level - 2 + Math.floor(Math.random() * 5)),
      health: 100,
      energy: 100,
      color: "blue",
    });

    setOpponent(aiPet);
    setInBattle(true);
    setBattleLog([`Battle started against ${aiPet.name}!`]);
  };

  const startPvPBattle = (pet: Pet) => {
    if (!selectedPet) {
      toast({
        title: "Select a Pet",
        description: "Choose a pet to battle with",
        variant: "destructive",
      });
      return;
    }

    const opponentPet = calculateStats(pet);
    setOpponent(opponentPet);
    setInBattle(true);
    setBattleLog([`Battle started against ${pet.name}!`]);
  };

  const attack = () => {
    if (!selectedPet || !opponent) return;

    const damage = Math.max(5, selectedPet.attack - opponent.defense + Math.floor(Math.random() * 10));
    const newOpponentHealth = Math.max(0, opponent.currentHealth - damage);
    
    setBattleLog((prev) => [...prev, `${selectedPet.name} dealt ${damage} damage!`]);
    setOpponent({ ...opponent, currentHealth: newOpponentHealth });

    if (newOpponentHealth <= 0) {
      endBattle(true);
      return;
    }

    // Opponent's turn
    setTimeout(() => {
      const opponentDamage = Math.max(5, opponent.attack - selectedPet.defense + Math.floor(Math.random() * 10));
      const newPlayerHealth = Math.max(0, selectedPet.currentHealth - opponentDamage);
      
      setBattleLog((prev) => [...prev, `${opponent.name} dealt ${opponentDamage} damage!`]);
      setSelectedPet({ ...selectedPet, currentHealth: newPlayerHealth });

      if (newPlayerHealth <= 0) {
        endBattle(false);
      }
    }, 1000);
  };

  const endBattle = async (won: boolean) => {
    const rewards = won ? 50 + selectedPet!.level * 10 : 10;
    const experience = won ? 30 + selectedPet!.level * 5 : 5;

    setBattleLog((prev) => [
      ...prev,
      won ? "🎉 Victory!" : "💔 Defeat...",
      `Earned ${rewards} PetPoints and ${experience} EXP!`,
    ]);

    if (user) {
      // Update pet points
      const { data: profile } = await supabase
        .from("profiles")
        .select("pet_points")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ pet_points: profile.pet_points + rewards })
          .eq("id", user.id);
      }

      // Update pet experience
      const { data: pet } = await supabase
        .from("pets")
        .select("experience, level")
        .eq("id", selectedPet!.id)
        .single();

      if (pet) {
        const newExp = pet.experience + experience;
        const newLevel = Math.floor(newExp / 100) + 1;
        await supabase
          .from("pets")
          .update({ experience: newExp, level: newLevel })
          .eq("id", selectedPet!.id);
      }

      // Save battle record
      await supabase.from("battles").insert([
        {
          attacker_id: user.id,
          attacker_pet_id: selectedPet!.id,
          defender_id: opponent?.id.startsWith("ai-") ? null : undefined,
          defender_pet_id: opponent!.id,
          is_ai_battle: opponent?.id.startsWith("ai-") || false,
          winner_id: won ? user.id : null,
          rewards_petpoints: rewards,
          rewards_experience: experience,
          status: "completed",
          completed_at: new Date().toISOString(),
        },
      ]);
    }

    setTimeout(() => {
      setInBattle(false);
      setOpponent(null);
      setSelectedPet(null);
      fetchMyPets();
    }, 3000);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
          <Card>
            <CardContent className="p-8">
              <p className="text-foreground">Please log in to battle</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-soft p-4">
        <div className="max-w-6xl mx-auto pt-20">
          <h1 className="text-4xl font-bold text-center mb-8 text-gradient">Pet Battle Arena</h1>

          {!inBattle ? (
            <Tabs defaultValue="select" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="select">Select Pet</TabsTrigger>
                <TabsTrigger value="opponents">Find Opponent</TabsTrigger>
              </TabsList>

              <TabsContent value="select">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Your Fighter</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {myPets.map((pet) => (
                      <Card
                        key={pet.id}
                        className={`cursor-pointer transition-all hover:shadow-elegant ${
                          selectedPet?.id === pet.id ? "ring-2 ring-primary shadow-glow" : ""
                        }`}
                        onClick={() => setSelectedPet(calculateStats(pet))}
                      >
                        <CardContent className="p-4 text-center">
                          <img
                            src={`/src/assets/pet-${pet.species}.png`}
                            alt={pet.name}
                            className="w-24 h-24 mx-auto mb-2"
                          />
                          <h3 className="font-semibold">{pet.name}</h3>
                          <p className="text-sm text-muted-foreground">Level {pet.level}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opponents">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        AI Battle
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={startAIBattle} disabled={!selectedPet} className="w-full">
                        Fight Wild Pet
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sword className="h-5 w-5" />
                        PvP Battles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {allPets.map((pet) => (
                        <Card key={pet.id} className="hover:shadow-elegant transition-all">
                          <CardContent className="p-4 text-center">
                            <img
                              src={`/src/assets/pet-${pet.species}.png`}
                              alt={pet.name}
                              className="w-20 h-20 mx-auto mb-2"
                            />
                            <h3 className="font-semibold">{pet.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">Level {pet.level}</p>
                            <Button
                              onClick={() => startPvPBattle(pet)}
                              disabled={!selectedPet}
                              size="sm"
                              className="w-full"
                            >
                              Challenge
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Battle in Progress!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center space-y-2">
                    <img
                      src={`/src/assets/pet-${selectedPet?.species}.png`}
                      alt={selectedPet?.name}
                      className="w-32 h-32 mx-auto"
                    />
                    <h3 className="font-bold">{selectedPet?.name}</h3>
                    <p className="text-sm text-muted-foreground">Level {selectedPet?.level}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>HP</span>
                        <span>
                          {selectedPet?.currentHealth}/{selectedPet?.maxHealth}
                        </span>
                      </div>
                      <Progress
                        value={(selectedPet!.currentHealth / selectedPet!.maxHealth) * 100}
                        className="bg-stat-health/20"
                      />
                    </div>
                    <div className="flex justify-center gap-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Sword className="h-4 w-4" /> {selectedPet?.attack}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4" /> {selectedPet?.defense}
                      </span>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <img
                      src={`/src/assets/pet-${opponent?.species}.png`}
                      alt={opponent?.name}
                      className="w-32 h-32 mx-auto"
                    />
                    <h3 className="font-bold">{opponent?.name}</h3>
                    <p className="text-sm text-muted-foreground">Level {opponent?.level}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>HP</span>
                        <span>
                          {opponent?.currentHealth}/{opponent?.maxHealth}
                        </span>
                      </div>
                      <Progress
                        value={(opponent!.currentHealth / opponent!.maxHealth) * 100}
                        className="bg-stat-health/20"
                      />
                    </div>
                    <div className="flex justify-center gap-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Sword className="h-4 w-4" /> {opponent?.attack}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4" /> {opponent?.defense}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-center">Battle Log</h4>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 max-h-40 overflow-y-auto">
                      {battleLog.map((log, index) => (
                        <p key={index} className="text-sm">
                          {log}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={attack}
                  disabled={!selectedPet || !opponent || selectedPet.currentHealth <= 0 || opponent.currentHealth <= 0}
                  className="w-full"
                  size="lg"
                >
                  <Sword className="mr-2 h-5 w-5" />
                  Attack!
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Battle;
