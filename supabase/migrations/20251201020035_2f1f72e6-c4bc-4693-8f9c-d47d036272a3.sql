-- Add missing foreign keys to battle_challenges (skip pet keys as they already exist)
ALTER TABLE public.battle_challenges
  ADD CONSTRAINT battle_challenges_challenger_id_fkey 
  FOREIGN KEY (challenger_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT battle_challenges_challenged_id_fkey 
  FOREIGN KEY (challenged_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add policy to allow users to view other profiles (for PVP matchmaking)
CREATE POLICY "Users can view other profiles for matchmaking"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Add indexes for faster battle challenge queries
CREATE INDEX idx_battle_challenges_challenged_id ON public.battle_challenges(challenged_id);
CREATE INDEX idx_battle_challenges_status ON public.battle_challenges(status);
CREATE INDEX idx_battle_challenges_expires_at ON public.battle_challenges(expires_at);