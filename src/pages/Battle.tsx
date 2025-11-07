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

interface Skill {
  name: string;
  power: number;
  element: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  level: number;
  health: number;
  energy: number;
  color: string;
  element: string;
  skills: Skill[];
}

interface BattlePet extends Pet {
  currentHealth: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
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
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

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
    if (data) {
      const parsedPets = data.map(pet => ({
        ...pet,
        skills: (pet.skills as any) || []
      }));
      setMyPets(parsedPets as Pet[]);
    }
  };

  const fetchAllPets = async () => {
    const { data } = await supabase
      .from("pets")
      .select("*")
      .neq("owner_id", user?.id)
      .limit(20);
    if (data) {
      const parsedPets = data.map(pet => ({
        ...pet,
        skills: (pet.skills as any) || []
      }));
      setAllPets(parsedPets as Pet[]);
    }
  };

  const getTypeEffectiveness = (attackElement: string, defenseElement: string): number => {
    const effectiveness: { [key: string]: { [key: string]: number } } = {
      fire: { water: 0.5, earth: 2, air: 1, light: 1, fire: 1 },
      water: { fire: 2, earth: 0.5, air: 1, light: 1, water: 1 },
      earth: { water: 2, air: 0.5, fire: 1, light: 1, earth: 1 },
      air: { earth: 2, fire: 0.5, water: 1, light: 1, air: 1 },
      light: { fire: 1, water: 1, earth: 1, air: 1, light: 1 },
    };
    return effectiveness[attackElement]?.[defenseElement] || 1;
  };

  const calculateStats = (pet: Pet): BattlePet => {
    const maxHealth = 100 + pet.level * 20;
    return {
      ...pet,
      currentHealth: maxHealth,
      maxHealth,
      attack: 10 + pet.level * 3,
      defense: 5 + pet.level * 2,
      speed: 8 + pet.level * 2,
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

    const elements = ["light", "fire", "water", "earth", "air"];
    const speciesNames = ["Fluff", "Spark", "Aqua", "Terra", "Cloud"];
    const speciesIds = ["fluff", "spark", "aqua", "terra", "cloud"];
    const randomIndex = Math.floor(Math.random() * 5);
    
    const aiPet: BattlePet = calculateStats({
      id: "ai-" + Date.now(),
      name: "Wild " + speciesNames[randomIndex],
      species: speciesIds[randomIndex],
      element: elements[randomIndex],
      level: Math.max(1, selectedPet.level - 2 + Math.floor(Math.random() * 5)),
      health: 100,
      energy: 100,
      color: "blue",
      skills: [],
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

  const attack = (skill?: Skill) => {
    if (!selectedPet || !opponent) return;

    const skillToUse = skill || { name: "Basic Attack", power: 20, element: selectedPet.element };
    const baseDamage = skill ? skillToUse.power : selectedPet.attack;
    const typeMultiplier = getTypeEffectiveness(skillToUse.element, opponent.element);
    const randomFactor = 0.85 + Math.random() * 0.3;
    const damage = Math.max(5, Math.floor((baseDamage - opponent.defense / 2) * typeMultiplier * randomFactor));
    
    const newOpponentHealth = Math.max(0, opponent.currentHealth - damage);
    
    let effectivenessText = "";
    if (typeMultiplier > 1) effectivenessText = " It's super effective!";
    if (typeMultiplier < 1) effectivenessText = " It's not very effective...";
    
    setBattleLog((prev) => [...prev, `${selectedPet.name} used ${skillToUse.name}! Dealt ${damage} damage!${effectivenessText}`]);
    setOpponent({ ...opponent, currentHealth: newOpponentHealth });

    if (newOpponentHealth <= 0) {
      endBattle(true);
      return;
    }

    // Opponent's turn
    setTimeout(() => {
      const opponentSkill = opponent.skills.length > 0 
        ? opponent.skills[Math.floor(Math.random() * opponent.skills.length)]
        : { name: "Basic Attack", power: 20, element: opponent.element };
      
      const opponentBaseDamage = opponent.skills.length > 0 ? opponentSkill.power : opponent.attack;
      const opponentTypeMultiplier = getTypeEffectiveness(opponentSkill.element, selectedPet.element);
      const opponentRandomFactor = 0.85 + Math.random() * 0.3;
      const opponentDamage = Math.max(5, Math.floor((opponentBaseDamage - selectedPet.defense / 2) * opponentTypeMultiplier * opponentRandomFactor));
      
      const newPlayerHealth = Math.max(0, selectedPet.currentHealth - opponentDamage);
      
      let opponentEffectivenessText = "";
      if (opponentTypeMultiplier > 1) opponentEffectivenessText = " It's super effective!";
      if (opponentTypeMultiplier < 1) opponentEffectivenessText = " It's not very effective...";
      
      setBattleLog((prev) => [...prev, `${opponent.name} used ${opponentSkill.name}! Dealt ${opponentDamage} damage!${opponentEffectivenessText}`]);
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
                    <p className="text-xs text-primary/80 font-semibold">{selectedPet?.element.charAt(0).toUpperCase()}{selectedPet?.element.slice(1)} Element</p>
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
                    <p className="text-xs text-primary/80 font-semibold">{opponent?.element.charAt(0).toUpperCase()}{opponent?.element.slice(1)} Element</p>
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

                {selectedPet && selectedPet.skills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-center">Skills</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPet.skills.map((skill, index) => (
                        <Button
                          key={index}
                          onClick={() => attack(skill)}
                          disabled={!selectedPet || !opponent || selectedPet.currentHealth <= 0 || opponent.currentHealth <= 0}
                          variant="outline"
                          size="sm"
                        >
                          <Zap className="mr-1 h-4 w-4" />
                          {skill.name}
                          <span className="ml-1 text-xs">({skill.power})</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => attack()}
                  disabled={!selectedPet || !opponent || selectedPet.currentHealth <= 0 || opponent.currentHealth <= 0}
                  className="w-full"
                  size="lg"
                >
                  <Sword className="mr-2 h-5 w-5" />
                  Basic Attack
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
