import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Swords, Trophy, Coins, Clock, X, Check, AlertCircle, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Player {
  id: string;
  username: string;
  pet_points: number;
  pet_count?: number;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  level: number;
  element: string;
}

interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenger_pet_id: string;
  challenged_pet_id: string | null;
  wager_amount: number;
  status: string;
  created_at: string;
  expires_at: string;
  challenger?: {
    username: string;
  };
  challenger_pet?: Pet;
}

interface PvPBattleInterfaceProps {
  selectedPets?: { id: string }[];
  onBattleStart: (battleId: string, isChallenger: boolean, challengerPetId: string, challengedPetId: string) => void;
}

export const PvPBattleInterface = ({ selectedPets, onBattleStart }: PvPBattleInterfaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [wagerAmount, setWagerAmount] = useState<number>(0);
  const [incomingChallenges, setIncomingChallenges] = useState<Challenge[]>([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState<Challenge[]>([]);
  const [myPoints, setMyPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [selectedPetForAccept, setSelectedPetForAccept] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetchPlayers();
      fetchMyPets();
      fetchChallenges();
      fetchMyPoints();
      
      // Subscribe to challenge updates for both incoming and outgoing
      const challengeChannel = supabase
        .channel('challenge-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'battle_challenges',
            filter: `challenged_id=eq.${user.id}`
          },
          () => {
            fetchChallenges();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'battle_challenges',
            filter: `challenger_id=eq.${user.id}`
          },
          async (payload) => {
            // Check if our challenge was accepted
            if (payload.new && (payload.new as any).status === 'accepted') {
              const challenge = payload.new as any;
              
              // Get the battle that was created
              const { data: battle } = await supabase
                .from('battles')
                .select('*')
                .eq('attacker_id', user.id)
                .eq('attacker_pet_id', challenge.challenger_pet_id)
                .eq('defender_pet_id', challenge.challenged_pet_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              
              if (battle) {
                toast({
                  title: "Challenge Accepted!",
                  description: "Your opponent is ready to battle!"
                });
                onBattleStart(battle.id, true, challenge.challenger_pet_id, challenge.challenged_pet_id);
              }
            }
            fetchChallenges();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(challengeChannel);
      };
    }
  }, [user, onBattleStart]);

  const fetchMyPoints = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('pet_points')
      .eq('id', user.id)
      .single();
    
    if (data) setMyPoints(data.pet_points);
  };

  const fetchPlayers = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, pet_points')
      .neq('id', user.id);

    if (!error && data) {
      // Get pet counts for each player
      const playersWithCounts = await Promise.all(
        data.map(async (player) => {
          const { count } = await supabase
            .from('pets')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', player.id);
          
          return { ...player, pet_count: count || 0 };
        })
      );
      
      setPlayers(playersWithCounts.filter(p => (p.pet_count || 0) > 0));
    }
  };

  const fetchMyPets = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('pets')
      .select('id, name, species, level, element')
      .eq('owner_id', user.id)
      .gte('health', 50)
      .gte('energy', 30);

    if (!error && data) {
      setMyPets(data);
    }
  };

  const fetchChallenges = async () => {
    if (!user) return;

    // Incoming challenges - fetch separately due to foreign key structure
    const { data: incoming } = await supabase
      .from('battle_challenges')
      .select('*')
      .eq('challenged_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (incoming && incoming.length > 0) {
      // Fetch challenger details and pets separately
      const enrichedChallenges = await Promise.all(
        incoming.map(async (challenge) => {
          const { data: challenger } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', challenge.challenger_id)
            .single();

          const { data: challengerPet } = await supabase
            .from('pets')
            .select('*')
            .eq('id', challenge.challenger_pet_id)
            .single();

          return {
            ...challenge,
            challenger,
            challenger_pet: challengerPet
          };
        })
      );
      
      setIncomingChallenges(enrichedChallenges as any);
    } else {
      setIncomingChallenges([]);
    }

    // Outgoing challenges
    const { data: outgoing } = await supabase
      .from('battle_challenges')
      .select('*')
      .eq('challenger_id', user.id)
      .eq('status', 'pending');

    if (outgoing) {
      setOutgoingChallenges(outgoing);
    }
  };

  const sendChallenge = async () => {
    if (!user || !selectedPlayer || !selectedPet) {
      toast({
        title: "Missing Information",
        description: "Please select a player and your pet",
        variant: "destructive"
      });
      return;
    }

    if (wagerAmount > myPoints) {
      toast({
        title: "Insufficient PetPoints",
        description: `You only have ${myPoints} PetPoints`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('battle_challenges')
      .insert({
        challenger_id: user.id,
        challenged_id: selectedPlayer.id,
        challenger_pet_id: selectedPet.id,
        wager_amount: wagerAmount
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Challenge Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Challenge Sent!",
        description: `Waiting for ${selectedPlayer.username} to respond...`
      });
      setSelectedPlayer(null);
      setSelectedPet(null);
      setWagerAmount(0);
      fetchChallenges();
    }
  };

  const acceptChallenge = async (challenge: Challenge) => {
    if (!user || !myPets.length) return;

    // Use selected pet or first available
    const petId = selectedPetForAccept[challenge.id] || myPets[0].id;
    const selectedPetForBattle = myPets.find(p => p.id === petId) || myPets[0];

    setLoading(true);

    const { data, error } = await supabase
      .rpc('accept_battle_challenge', {
        p_challenge_id: challenge.id,
        p_challenged_pet_id: selectedPetForBattle.id
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Failed to Accept",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      const result = data as { success: boolean; battle_id: string; wager_amount: number };
      if (result.battle_id) {
        toast({
          title: "Battle Started!",
          description: `Wager: ${result.wager_amount} PetPoints each`
        });
        fetchChallenges();
        fetchMyPoints();
        onBattleStart(result.battle_id, false, challenge.challenger_pet_id, selectedPetForBattle.id);
      }
    }
  };

  const declineChallenge = async (challengeId: string) => {
    const { error } = await supabase
      .from('battle_challenges')
      .update({ status: 'declined' })
      .eq('id', challengeId);

    if (!error) {
      toast({
        title: "Challenge Declined",
        description: "The challenge has been declined"
      });
      fetchChallenges();
    }
  };

  const cancelChallenge = async (challengeId: string) => {
    const { error } = await supabase
      .from('battle_challenges')
      .update({ status: 'cancelled' })
      .eq('id', challengeId);

    if (!error) {
      toast({
        title: "Challenge Cancelled",
        description: "Your challenge has been cancelled"
      });
      fetchChallenges();
    }
  };

  return (
    <div className="space-y-6">
      {/* Incoming Challenges */}
      {incomingChallenges.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              Incoming Challenges ({incomingChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomingChallenges.map((challenge) => (
              <Card key={challenge.id} className="bg-background/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{challenge.challenger?.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {challenge.challenger_pet?.name} (Lv. {challenge.challenger_pet?.level} {challenge.challenger_pet?.element})
                      </p>
                      {challenge.wager_amount > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Coins className="w-3 h-3" />
                          {challenge.wager_amount} PP Wager
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Pet Selection for Accept */}
                  <div className="space-y-2">
                    <Label className="text-xs">Choose your pet:</Label>
                    <div className="flex gap-2 flex-wrap">
                      {myPets.map((pet) => (
                        <Button
                          key={pet.id}
                          size="sm"
                          variant={selectedPetForAccept[challenge.id] === pet.id || (!selectedPetForAccept[challenge.id] && pet.id === myPets[0]?.id) ? "default" : "outline"}
                          onClick={() => setSelectedPetForAccept(prev => ({ ...prev, [challenge.id]: pet.id }))}
                          className="h-8 text-xs"
                        >
                          {pet.name} (Lv.{pet.level})
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => acceptChallenge(challenge)}
                      disabled={loading || myPets.length === 0}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineChallenge(challenge.id)}
                      disabled={loading}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Outgoing Challenges */}
      {outgoingChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Challenges ({outgoingChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {outgoingChallenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Waiting for response...</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => cancelChallenge(challenge.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Challenge New Player */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Challenge a Player
            </span>
            <Badge variant="outline" className="gap-1">
              <Coins className="w-4 h-4" />
              {myPoints} PP
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pet Selection */}
          <div className="space-y-2">
            <Label>Your Pet</Label>
            {myPets.length === 0 ? (
              <div className="flex items-center gap-2 p-3 border rounded-lg text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">No pets available (need 50+ health, 30+ energy)</span>
              </div>
            ) : (
              <ScrollArea className="h-24">
                <div className="grid grid-cols-2 gap-2">
                  {myPets.map((pet) => (
                    <Button
                      key={pet.id}
                      variant={selectedPet?.id === pet.id ? "default" : "outline"}
                      className="h-auto py-2 justify-start"
                      onClick={() => setSelectedPet(pet)}
                    >
                      <div className="text-left">
                        <p className="font-semibold text-sm">{pet.name}</p>
                        <p className="text-xs opacity-80">Lv. {pet.level} {pet.element}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Separator />

          {/* Player Selection */}
          <div className="space-y-2">
            <Label>Select Opponent</Label>
            <ScrollArea className="h-48 border rounded-lg">
              <div className="p-2 space-y-2">
                {players.map((player) => (
                  <Button
                    key={player.id}
                    variant={selectedPlayer?.id === player.id ? "default" : "outline"}
                    className="w-full h-auto py-3 justify-between"
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <div className="text-left">
                      <p className="font-semibold">{player.username}</p>
                      <p className="text-xs opacity-80">{player.pet_count} pets available</p>
                    </div>
                    <Badge variant="secondary">{player.pet_points} PP</Badge>
                  </Button>
                ))}
                {players.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No players available
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Wager Amount */}
          <div className="space-y-2">
            <Label htmlFor="wager">Wager Amount (Optional)</Label>
            <Input
              id="wager"
              type="number"
              min="0"
              max={myPoints}
              value={wagerAmount}
              onChange={(e) => setWagerAmount(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
            {wagerAmount > 0 && (
              <p className="text-xs text-muted-foreground">
                Winner takes {wagerAmount * 2} PetPoints (each player bets {wagerAmount} PP)
              </p>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={sendChallenge}
            disabled={!selectedPlayer || !selectedPet || loading || myPets.length === 0}
          >
            <Swords className="w-4 h-4 mr-2" />
            Send Challenge
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};