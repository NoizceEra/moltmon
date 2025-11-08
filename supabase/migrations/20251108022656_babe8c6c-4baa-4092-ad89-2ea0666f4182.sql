-- Create quest types enum
CREATE TYPE public.quest_type AS ENUM ('pet_care', 'battle', 'challenge');

-- Create quest status enum
CREATE TYPE public.quest_status AS ENUM ('active', 'completed', 'claimed');

-- Create daily quests table
CREATE TABLE public.daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_type public.quest_type NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 1,
  reward_petpoints INTEGER NOT NULL DEFAULT 0,
  reward_experience INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user quest progress table
CREATE TABLE public.user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.daily_quests(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0,
  status public.quest_status NOT NULL DEFAULT 'active',
  assigned_at DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quest_id, assigned_at)
);

-- Enable RLS
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_quests
CREATE POLICY "Anyone can view daily quests"
  ON public.daily_quests
  FOR SELECT
  USING (true);

-- RLS Policies for user_quest_progress
CREATE POLICY "Users can view their own quest progress"
  ON public.user_quest_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quest progress"
  ON public.user_quest_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest progress"
  ON public.user_quest_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_quest_progress_updated_at
  BEFORE UPDATE ON public.user_quest_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to assign daily quests to user
CREATE OR REPLACE FUNCTION public.assign_daily_quests_to_user(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert quest progress for all daily quests that user doesn't have for today
  INSERT INTO public.user_quest_progress (user_id, quest_id, assigned_at)
  SELECT p_user_id, dq.id, CURRENT_DATE
  FROM public.daily_quests dq
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_quest_progress uqp
    WHERE uqp.user_id = p_user_id
      AND uqp.quest_id = dq.id
      AND uqp.assigned_at = CURRENT_DATE
  );
END;
$$;