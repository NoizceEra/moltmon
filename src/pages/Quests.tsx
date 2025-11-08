import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Zap, Heart, Swords, CheckCircle, Gift } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: 'pet_care' | 'battle' | 'challenge';
  target_count: number;
  reward_petpoints: number;
  reward_experience: number;
}

interface UserQuestProgress {
  id: string;
  quest_id: string;
  current_count: number;
  status: 'active' | 'completed' | 'claimed';
  quest: Quest;
}

const questIcons = {
  pet_care: Heart,
  battle: Swords,
  challenge: Trophy,
};

const questColors = {
  pet_care: "text-pink-500",
  battle: "text-red-500",
  challenge: "text-yellow-500",
};

export default function Quests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quests, setQuests] = useState<UserQuestProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuests = async () => {
    if (!user) return;

    try {
      // Assign daily quests to user
      await supabase.rpc('assign_daily_quests_to_user', { p_user_id: user.id });

      // Fetch user quest progress with quest details
      const { data, error } = await supabase
        .from('user_quest_progress')
        .select(`
          *,
          quest:daily_quests(*)
        `)
        .eq('user_id', user.id)
        .eq('assigned_at', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      
      setQuests(data as unknown as UserQuestProgress[]);
    } catch (error) {
      console.error('Error fetching quests:', error);
      toast({
        title: "Error",
        description: "Failed to load daily quests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [user]);

  const claimReward = async (questProgress: UserQuestProgress) => {
    if (!user) return;

    try {
      // Use atomic RPC function to prevent race conditions
      const { error } = await supabase.rpc('claim_quest_reward', {
        p_user_id: user.id,
        p_quest_progress_id: questProgress.id,
        p_reward_points: questProgress.quest.reward_petpoints
      });

      if (error) throw error;

      toast({
        title: "Reward Claimed!",
        description: `You earned ${questProgress.quest.reward_petpoints} Pet Points!`,
      });

      // Refresh quests
      fetchQuests();
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim reward",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quests...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const activeQuests = quests.filter(q => q.status === 'active' || q.status === 'completed');
  const claimedQuests = quests.filter(q => q.status === 'claimed');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Zap className="text-yellow-500" />
            Daily Quests
          </h1>
          <p className="text-muted-foreground">
            Complete daily quests to earn rewards and level up your pets!
          </p>
        </div>

        {activeQuests.length === 0 && claimedQuests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Quests Available</h3>
              <p className="text-muted-foreground">Check back tomorrow for new daily quests!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {activeQuests.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Active Quests</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeQuests.map((questProgress) => {
                    const Icon = questIcons[questProgress.quest.quest_type];
                    const progress = Math.min((questProgress.current_count / questProgress.quest.target_count) * 100, 100);
                    const isCompleted = questProgress.status === 'completed';

                    return (
                      <Card key={questProgress.id} className={isCompleted ? "border-green-500" : ""}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Icon className={`w-6 h-6 mt-1 ${questColors[questProgress.quest.quest_type]}`} />
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {questProgress.quest.title}
                                  {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                                </CardTitle>
                                <CardDescription>{questProgress.quest.description}</CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {questProgress.current_count} / {questProgress.quest.target_count}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Gift className="w-3 h-3" />
                                {questProgress.quest.reward_petpoints} Points
                              </Badge>
                              {questProgress.quest.reward_experience > 0 && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  {questProgress.quest.reward_experience} XP
                                </Badge>
                              )}
                            </div>

                            {isCompleted && (
                              <Button 
                                size="sm" 
                                onClick={() => claimReward(questProgress)}
                                className="flex items-center gap-1"
                              >
                                <Gift className="w-4 h-4" />
                                Claim
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {claimedQuests.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">Completed Today</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {claimedQuests.map((questProgress) => {
                    const Icon = questIcons[questProgress.quest.quest_type];

                    return (
                      <Card key={questProgress.id} className="opacity-60">
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <Icon className={`w-6 h-6 mt-1 ${questColors[questProgress.quest.quest_type]}`} />
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {questProgress.quest.title}
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              </CardTitle>
                              <CardDescription>{questProgress.quest.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            Claimed
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
