-- Create battle_turns table to track each action in a battle
CREATE TABLE public.battle_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('attacker', 'defender')),
  action_type TEXT NOT NULL CHECK (action_type IN ('attack', 'defend', 'dodge', 'special', 'skill', 'item', 'switch')),
  skill_used TEXT,
  item_used TEXT,
  damage_dealt INTEGER DEFAULT 0,
  attacker_hp INTEGER NOT NULL,
  defender_hp INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(battle_id, turn_number)
);

-- Enable RLS
ALTER TABLE public.battle_turns ENABLE ROW LEVEL SECURITY;

-- Users can view turns for battles they're part of
CREATE POLICY "Users can view their battle turns"
ON public.battle_turns
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.battles
    WHERE battles.id = battle_turns.battle_id
    AND (battles.attacker_id = auth.uid() OR battles.defender_id = auth.uid())
  )
);

-- Users can insert turns for their active battles
CREATE POLICY "Users can create turns for their battles"
ON public.battle_turns
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.battles
    WHERE battles.id = battle_turns.battle_id
    AND (battles.attacker_id = auth.uid() OR battles.defender_id = auth.uid())
    AND battles.status = 'active'
  )
);

-- Add index for performance
CREATE INDEX idx_battle_turns_battle_id ON public.battle_turns(battle_id);
CREATE INDEX idx_battle_turns_turn_number ON public.battle_turns(battle_id, turn_number);