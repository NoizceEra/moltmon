import { supabase } from "@/integrations/supabase/client";

export async function trackQuestProgress(
  userId: string,
  questType: 'pet_care' | 'battle' | 'challenge',
  increment: number = 1
) {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Get active quests of this type for today
    const { data: questProgress, error: fetchError } = await supabase
      .from('user_quest_progress')
      .select(`
        id,
        current_count,
        status,
        quest:daily_quests!inner(id, quest_type, target_count)
      `)
      .eq('user_id', userId)
      .eq('assigned_at', today)
      .eq('status', 'active')
      .eq('quest.quest_type', questType);

    if (fetchError) throw fetchError;

    // Update progress for each matching quest
    for (const progress of questProgress || []) {
      const newCount = progress.current_count + increment;
      const quest = progress.quest as any;
      const isCompleted = newCount >= quest.target_count;

      await supabase
        .from('user_quest_progress')
        .update({
          current_count: newCount,
          status: isCompleted ? 'completed' : 'active',
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', progress.id);
    }
  } catch (error) {
    console.error('Error tracking quest progress:', error);
  }
}
