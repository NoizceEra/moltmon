-- Create battle challenges table
CREATE TABLE public.battle_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL,
  challenged_id UUID NOT NULL,
  challenger_pet_id UUID NOT NULL REFERENCES pets(id),
  challenged_pet_id UUID REFERENCES pets(id),
  wager_amount INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '5 minutes'
);

-- Enable RLS
ALTER TABLE public.battle_challenges ENABLE ROW LEVEL SECURITY;

-- Policies for battle challenges
CREATE POLICY "Users can view their challenges"
  ON public.battle_challenges
  FOR SELECT
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create challenges"
  ON public.battle_challenges
  FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update their challenges"
  ON public.battle_challenges
  FOR UPDATE
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Enable realtime for PVP features
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_turns;

-- Function to accept challenge and create PVP battle
CREATE OR REPLACE FUNCTION accept_battle_challenge(
  p_challenge_id UUID,
  p_challenged_pet_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge RECORD;
  v_battle_id UUID;
  v_challenger_points INTEGER;
  v_challenged_points INTEGER;
BEGIN
  -- Get and lock challenge
  SELECT * INTO v_challenge
  FROM battle_challenges
  WHERE id = p_challenge_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Challenge not found or already processed';
  END IF;

  IF v_challenge.challenged_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to accept this challenge';
  END IF;

  IF v_challenge.expires_at < NOW() THEN
    RAISE EXCEPTION 'Challenge has expired';
  END IF;

  -- Verify pet ownership
  IF NOT EXISTS (
    SELECT 1 FROM pets 
    WHERE id = p_challenged_pet_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Pet does not belong to you';
  END IF;

  -- If there's a wager, deduct from both players
  IF v_challenge.wager_amount > 0 THEN
    SELECT pet_points INTO v_challenger_points
    FROM profiles
    WHERE id = v_challenge.challenger_id
    FOR UPDATE;

    SELECT pet_points INTO v_challenged_points
    FROM profiles
    WHERE id = v_challenge.challenged_id
    FOR UPDATE;

    IF v_challenger_points < v_challenge.wager_amount THEN
      RAISE EXCEPTION 'Challenger has insufficient PetPoints';
    END IF;

    IF v_challenged_points < v_challenge.wager_amount THEN
      RAISE EXCEPTION 'You have insufficient PetPoints';
    END IF;

    -- Deduct wager from both players
    UPDATE profiles
    SET pet_points = pet_points - v_challenge.wager_amount
    WHERE id = v_challenge.challenger_id;

    UPDATE profiles
    SET pet_points = pet_points - v_challenge.wager_amount
    WHERE id = v_challenge.challenged_id;
  END IF;

  -- Create PVP battle
  INSERT INTO battles (
    attacker_id,
    attacker_pet_id,
    defender_id,
    defender_pet_id,
    is_ai_battle,
    status
  ) VALUES (
    v_challenge.challenger_id,
    v_challenge.challenger_pet_id,
    v_challenge.challenged_id,
    p_challenged_pet_id,
    false,
    'active'
  )
  RETURNING id INTO v_battle_id;

  -- Mark challenge as accepted
  UPDATE battle_challenges
  SET status = 'accepted', challenged_pet_id = p_challenged_pet_id
  WHERE id = p_challenge_id;

  RETURN json_build_object(
    'success', true,
    'battle_id', v_battle_id,
    'wager_amount', v_challenge.wager_amount
  );
END;
$$;