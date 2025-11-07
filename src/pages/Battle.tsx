import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sword, Shield, Zap, Cloud, Flame, Droplet, Mountain, Wind, Sparkles, MoveRight } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

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

type StatusEffect = "burn" | "freeze" | "paralysis" | "poison" | null;
type Weather = "sunny" | "rainy" | "windy" | "rocky" | "clear";

interface BattlePet extends Pet {
  currentHealth: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  statusEffect: StatusEffect;
  statusTurns: number;
  isDefending: boolean;
  isDodging: boolean;
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
  const [weather, setWeather] = useState<Weather>("clear");
  const [comboCount, setComboCount] = useState(0);
  const [lastSkillElement, setLastSkillElement] = useState<string | null>(null);

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
      light: { fire: 1.2, water: 1.2, earth: 1.2, air: 1.2, light: 1 },
    };
    return effectiveness[attackElement]?.[defenseElement] || 1;
  };

  const getWeatherBonus = (element: string, currentWeather: Weather): number => {
    const bonuses: { [key: string]: { [key in Weather]: number } } = {
      fire: { sunny: 1.5, rainy: 0.7, windy: 1, rocky: 1, clear: 1 },
      water: { sunny: 0.7, rainy: 1.5, windy: 1, rocky: 1, clear: 1 },
      air: { sunny: 1, rainy: 1, windy: 1.5, rocky: 0.7, clear: 1 },
      earth: { sunny: 1, rainy: 1, windy: 0.7, rocky: 1.5, clear: 1 },
      light: { sunny: 1.3, rainy: 1, windy: 1, rocky: 1, clear: 1 },
    };
    return bonuses[element]?.[currentWeather] || 1;
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
      statusEffect: null,
      statusTurns: 0,
      isDefending: false,
      isDodging: false,
    };
  };

  const randomWeather = (): Weather => {
    const weathers: Weather[] = ["sunny", "rainy", "windy", "rocky", "clear"];
    return weathers[Math.floor(Math.random() * weathers.length)];
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

    const newWeather = randomWeather();
    setWeather(newWeather);
    setOpponent(aiPet);
    setInBattle(true);
    setComboCount(0);
    setLastSkillElement(null);
    setBattleLog([
      `Battle started against ${aiPet.name}!`,
      `Weather: ${newWeather.charAt(0).toUpperCase() + newWeather.slice(1)}`
    ]);
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
    const newWeather = randomWeather();
    setWeather(newWeather);
    setOpponent(opponentPet);
    setInBattle(true);
    setComboCount(0);
    setLastSkillElement(null);
    setBattleLog([
      `Battle started against ${pet.name}!`,
      `Weather: ${newWeather.charAt(0).toUpperCase() + newWeather.slice(1)}`
    ]);
  };

  const applyStatusEffect = (attacker: BattlePet, defender: BattlePet): { defender: BattlePet, log: string } => {
    let log = "";
    const chance = 0.15;
    
    if (Math.random() < chance && !defender.statusEffect) {
      const statusMap: { [key: string]: StatusEffect } = {
        fire: "burn",
        water: "freeze",
        air: "paralysis",
        earth: "poison",
      };
      
      const status = statusMap[attacker.element];
      if (status) {
        defender = { ...defender, statusEffect: status, statusTurns: 3 };
        const statusNames = { burn: "Burned", freeze: "Frozen", paralysis: "Paralyzed", poison: "Poisoned" };
        log = `${defender.name} was ${statusNames[status]}!`;
      }
    }
    
    return { defender, log };
  };

  const processStatusEffect = (pet: BattlePet): { pet: BattlePet, damage: number, log: string } => {
    if (!pet.statusEffect || pet.statusTurns <= 0) {
      return { pet: { ...pet, statusEffect: null, statusTurns: 0 }, damage: 0, log: "" };
    }

    let damage = 0;
    let log = "";
    const newTurns = pet.statusTurns - 1;

    switch (pet.statusEffect) {
      case "burn":
        damage = Math.floor(pet.maxHealth * 0.08);
        log = `${pet.name} took ${damage} burn damage!`;
        break;
      case "poison":
        damage = Math.floor(pet.maxHealth * 0.06);
        log = `${pet.name} took ${damage} poison damage!`;
        break;
      case "freeze":
        log = `${pet.name} is frozen and can't attack!`;
        break;
      case "paralysis":
        if (Math.random() < 0.25) {
          log = `${pet.name} is paralyzed and can't move!`;
        }
        break;
    }

    const newHealth = Math.max(0, pet.currentHealth - damage);
    const updatedPet = {
      ...pet,
      currentHealth: newHealth,
      statusTurns: newTurns,
      statusEffect: newTurns > 0 ? pet.statusEffect : null
    };

    return { pet: updatedPet, damage, log };
  };

  const defend = () => {
    if (!selectedPet || !opponent) return;

    setSelectedPet({ ...selectedPet, isDefending: true, isDodging: false });
    setBattleLog((prev) => [...prev, `${selectedPet.name} took a defensive stance!`]);

    setTimeout(() => opponentTurn(), 1000);
  };

  const dodge = () => {
    if (!selectedPet || !opponent) return;

    setSelectedPet({ ...selectedPet, isDodging: true, isDefending: false });
    setBattleLog((prev) => [...prev, `${selectedPet.name} prepares to dodge and counter!`]);

    setTimeout(() => opponentTurn(), 1000);
  };

  const specialAttack = () => {
    if (!selectedPet || !opponent) return;

    // Special attack is a powerful attack with 2x damage
    const specialSkill: Skill = {
      name: "Special Attack",
      power: selectedPet.attack * 2,
      element: selectedPet.element
    };

    setBattleLog((prev) => [...prev, `${selectedPet.name} charges a special attack!`]);
    attack(specialSkill);
  };

  const attack = (skill?: Skill) => {
    if (!selectedPet || !opponent) return;

    // Reset defensive stances
    setSelectedPet({ ...selectedPet, isDefending: false, isDodging: false });

    // Check if frozen
    if (selectedPet.statusEffect === "freeze") {
      const statusResult = processStatusEffect(selectedPet);
      setSelectedPet(statusResult.pet);
      setBattleLog((prev) => [...prev, statusResult.log]);
      
      setTimeout(() => {
        opponentTurn();
      }, 1000);
      return;
    }

    // Check if paralyzed
    if (selectedPet.statusEffect === "paralysis" && Math.random() < 0.25) {
      const statusResult = processStatusEffect(selectedPet);
      setSelectedPet(statusResult.pet);
      setBattleLog((prev) => [...prev, statusResult.log]);
      
      setTimeout(() => {
        opponentTurn();
      }, 1000);
      return;
    }

    const skillToUse = skill || { name: "Basic Attack", power: 20, element: selectedPet.element };
    
    // Combo system
    let comboBonus = 1;
    if (skill && lastSkillElement === skill.element) {
      setComboCount(prev => prev + 1);
      comboBonus = 1 + (comboCount * 0.15);
    } else {
      setComboCount(0);
    }
    setLastSkillElement(skill?.element || null);

    // Calculate dodge chance
    const speedDiff = selectedPet.speed - opponent.speed;
    const dodgeChance = Math.max(0, Math.min(0.3, speedDiff * 0.02));
    
    if (Math.random() < dodgeChance) {
      setBattleLog((prev) => [...prev, `${opponent.name} dodged the attack!`]);
      setTimeout(() => opponentTurn(), 1000);
      return;
    }

    // Calculate critical hit
    const critChance = 0.15 + (selectedPet.speed * 0.001);
    const isCrit = Math.random() < critChance;
    const critMultiplier = isCrit ? 1.5 : 1;

    const baseDamage = skill ? skillToUse.power : selectedPet.attack;
    const typeMultiplier = getTypeEffectiveness(skillToUse.element, opponent.element);
    const weatherMultiplier = getWeatherBonus(skillToUse.element, weather);
    const randomFactor = 0.85 + Math.random() * 0.3;
    const damage = Math.max(5, Math.floor(
      (baseDamage - opponent.defense / 2) * 
      typeMultiplier * 
      weatherMultiplier * 
      critMultiplier * 
      comboBonus * 
      randomFactor
    ));
    
    let newOpponentHealth = Math.max(0, opponent.currentHealth - damage);
    
    let messages = [];
    messages.push(`${selectedPet.name} used ${skillToUse.name}! Dealt ${damage} damage!`);
    
    if (isCrit) messages.push("💥 Critical hit!");
    if (typeMultiplier > 1) messages.push("✨ It's super effective!");
    if (typeMultiplier < 1) messages.push("💨 It's not very effective...");
    if (comboBonus > 1) messages.push(`🔥 ${comboCount + 1}x Combo!`);
    if (weatherMultiplier > 1) messages.push("☀️ Weather boosted!");

    // Apply status effect
    const statusResult = applyStatusEffect(selectedPet, opponent);
    let updatedOpponent = { ...statusResult.defender, currentHealth: newOpponentHealth };
    if (statusResult.log) messages.push(statusResult.log);

    setBattleLog((prev) => [...prev, ...messages]);
    setOpponent(updatedOpponent);

    if (newOpponentHealth <= 0) {
      endBattle(true);
      return;
    }

    // Process player's status effect
    const playerStatusResult = processStatusEffect(selectedPet);
    setSelectedPet(playerStatusResult.pet);
    if (playerStatusResult.log) {
      setBattleLog((prev) => [...prev, playerStatusResult.log]);
    }
    if (playerStatusResult.pet.currentHealth <= 0) {
      endBattle(false);
      return;
    }

    setTimeout(() => opponentTurn(), 1500);
  };

  const opponentTurn = () => {
    if (!selectedPet || !opponent) return;

    // Reset opponent defensive stances
    setOpponent({ ...opponent, isDefending: false, isDodging: false });

    // Check if frozen
    if (opponent.statusEffect === "freeze") {
      const statusResult = processStatusEffect(opponent);
      setOpponent(statusResult.pet);
      setBattleLog((prev) => [...prev, statusResult.log]);
      return;
    }

    // Check if paralyzed
    if (opponent.statusEffect === "paralysis" && Math.random() < 0.25) {
      const statusResult = processStatusEffect(opponent);
      setOpponent(statusResult.pet);
      setBattleLog((prev) => [...prev, statusResult.log]);
      return;
    }

    // Check if player is dodging (75% chance to dodge)
    if (selectedPet.isDodging && Math.random() < 0.75) {
      setBattleLog((prev) => [...prev, `${selectedPet.name} dodged the attack!`]);
      
      // Counter attack with 50% power
      const counterDamage = Math.floor(selectedPet.attack * 0.5);
      const newOpponentHealth = Math.max(0, opponent.currentHealth - counterDamage);
      setOpponent({ ...opponent, currentHealth: newOpponentHealth });
      setBattleLog((prev) => [...prev, `${selectedPet.name} countered for ${counterDamage} damage!`]);
      
      if (newOpponentHealth <= 0) {
        endBattle(true);
      }
      return;
    }

    const opponentSkill = opponent.skills.length > 0 
      ? opponent.skills[Math.floor(Math.random() * opponent.skills.length)]
      : { name: "Basic Attack", power: 20, element: opponent.element };
    
    // Calculate dodge (natural dodge chance)
    const speedDiff = opponent.speed - selectedPet.speed;
    const dodgeChance = Math.max(0, Math.min(0.3, speedDiff * 0.02));
    
    if (Math.random() < dodgeChance) {
      setBattleLog((prev) => [...prev, `${selectedPet.name} dodged the attack!`]);
      return;
    }

    // Calculate critical hit
    const critChance = 0.15 + (opponent.speed * 0.001);
    const isCrit = Math.random() < critChance;
    const critMultiplier = isCrit ? 1.5 : 1;

    const opponentBaseDamage = opponent.skills.length > 0 ? opponentSkill.power : opponent.attack;
    const opponentTypeMultiplier = getTypeEffectiveness(opponentSkill.element, selectedPet.element);
    const weatherMultiplier = getWeatherBonus(opponentSkill.element, weather);
    const opponentRandomFactor = 0.85 + Math.random() * 0.3;
    
    // Apply defense reduction if defending (reduce damage by 50%)
    const defenseMultiplier = selectedPet.isDefending ? 0.5 : 1;
    
    const opponentDamage = Math.max(5, Math.floor(
      (opponentBaseDamage - selectedPet.defense / 2) * 
      opponentTypeMultiplier * 
      weatherMultiplier * 
      critMultiplier * 
      defenseMultiplier *
      opponentRandomFactor
    ));
    
    let newPlayerHealth = Math.max(0, selectedPet.currentHealth - opponentDamage);
    
    let messages = [];
    messages.push(`${opponent.name} used ${opponentSkill.name}! Dealt ${opponentDamage} damage!`);
    
    if (selectedPet.isDefending) messages.push("🛡️ Damage reduced by defense!");
    if (isCrit) messages.push("💥 Critical hit!");
    if (opponentTypeMultiplier > 1) messages.push("✨ It's super effective!");
    if (opponentTypeMultiplier < 1) messages.push("💨 It's not very effective...");
    if (weatherMultiplier > 1) messages.push("☀️ Weather boosted!");

    // Apply status effect
    const statusResult = applyStatusEffect(opponent, selectedPet);
    let updatedPlayer = { ...statusResult.defender, currentHealth: newPlayerHealth };
    if (statusResult.log) messages.push(statusResult.log);

    setBattleLog((prev) => [...prev, ...messages]);
    setSelectedPet(updatedPlayer);

    if (newPlayerHealth <= 0) {
      endBattle(false);
      return;
    }

    // Process opponent's status effect
    const opponentStatusResult = processStatusEffect(opponent);
    setOpponent(opponentStatusResult.pet);
    if (opponentStatusResult.log) {
      setBattleLog((prev) => [...prev, opponentStatusResult.log]);
    }
    if (opponentStatusResult.pet.currentHealth <= 0) {
      endBattle(true);
    }
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
      setComboCount(0);
      setLastSkillElement(null);
      fetchMyPets();
    }, 3000);
  };

  const getWeatherIcon = () => {
    const icons = {
      sunny: <Flame className="w-4 h-4" />,
      rainy: <Droplet className="w-4 h-4" />,
      windy: <Wind className="w-4 h-4" />,
      rocky: <Mountain className="w-4 h-4" />,
      clear: <Cloud className="w-4 h-4" />
    };
    return icons[weather];
  };

  const getStatusBadge = (status: StatusEffect) => {
    if (!status) return null;
    
    const variants = {
      burn: { text: "🔥 Burn", color: "destructive" as const },
      freeze: { text: "❄️ Freeze", color: "secondary" as const },
      paralysis: { text: "⚡ Paralysis", color: "default" as const },
      poison: { text: "☠️ Poison", color: "destructive" as const },
    };
    
    const badge = variants[status];
    return <Badge variant={badge.color} className="text-xs">{badge.text}</Badge>;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card>
            <CardContent className="p-8">
              <p className="text-foreground">Please log in to battle</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 p-4">
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
                          <Badge variant="secondary" className="mt-2 text-xs capitalize">
                            {pet.element}
                          </Badge>
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
                <div className="flex justify-between items-center">
                  <CardTitle className="text-center flex-1">Battle in Progress!</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getWeatherIcon()}
                    <span className="capitalize">{weather}</span>
                  </Badge>
                </div>
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
                    <Badge variant="secondary" className="text-xs capitalize">{selectedPet?.element}</Badge>
                    {selectedPet?.statusEffect && getStatusBadge(selectedPet.statusEffect)}
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
                    <Badge variant="secondary" className="text-xs capitalize">{opponent?.element}</Badge>
                    {opponent?.statusEffect && getStatusBadge(opponent.statusEffect)}
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

                {comboCount > 0 && (
                  <div className="text-center">
                    <Badge variant="default" className="text-sm">
                      🔥 {comboCount + 1}x Combo Active!
                    </Badge>
                  </div>
                )}

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

                <div className="space-y-4">
                  <h4 className="font-semibold text-center">Actions</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => attack()}
                      disabled={!selectedPet || !opponent || selectedPet.currentHealth <= 0 || opponent.currentHealth <= 0}
                      variant="default"
                      size="lg"
                    >
                      <Sword className="mr-2 h-5 w-5" />
                      Attack
                    </Button>

                    <Button
                      onClick={defend}
                      disabled={!selectedPet || !opponent || selectedPet.currentHealth <= 0 || opponent.currentHealth <= 0}
                      variant="secondary"
                      size="lg"
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Defend
                    </Button>

                    <Button
                      onClick={dodge}
                      disabled={!selectedPet || !opponent || selectedPet.currentHealth <= 0 || opponent.currentHealth <= 0}
                      variant="secondary"
                      size="lg"
                    >
                      <MoveRight className="mr-2 h-5 w-5" />
                      Dodge
                    </Button>

                    <Button
                      onClick={specialAttack}
                      disabled={!selectedPet || !opponent || selectedPet.currentHealth <= 0 || opponent.currentHealth <= 0}
                      variant="default"
                      size="lg"
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Special
                    </Button>
                  </div>

                  {selectedPet && selectedPet.skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-center text-sm">Element Skills</h4>
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Battle;
