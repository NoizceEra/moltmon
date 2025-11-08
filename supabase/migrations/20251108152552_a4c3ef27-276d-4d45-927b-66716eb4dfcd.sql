-- Fix 1: Create atomic quest reward claiming function with transaction locking
CREATE OR REPLACE FUNCTION public.claim_quest_reward(
  p_user_id UUID,
  p_quest_progress_id UUID,
  p_reward_points INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status quest_status;
  v_result JSON;
BEGIN
  -- Lock the quest progress row to prevent race conditions
  SELECT status INTO v_current_status
  FROM user_quest_progress
  WHERE id = p_quest_progress_id
    AND user_id = p_user_id
  FOR UPDATE;

  -- Check if already claimed or not completed
  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Quest not found';
  END IF;

  IF v_current_status != 'completed' THEN
    RAISE EXCEPTION 'Quest not completed or already claimed';
  END IF;

  -- Update quest status and profile points atomically
  UPDATE user_quest_progress
  SET status = 'claimed',
      claimed_at = NOW()
  WHERE id = p_quest_progress_id;

  UPDATE profiles
  SET pet_points = pet_points + p_reward_points
  WHERE id = p_user_id;

  SELECT json_build_object('success', true) INTO v_result;
  RETURN v_result;
END;
$$;

-- Fix 2: Create atomic shop purchase function with transaction locking
CREATE OR REPLACE FUNCTION public.purchase_shop_item(
  p_user_id UUID,
  p_item_id UUID,
  p_item_price INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_points INTEGER;
  v_inventory_id UUID;
BEGIN
  -- Lock user's profile row to prevent race conditions
  SELECT pet_points INTO v_current_points
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check sufficient funds
  IF v_current_points < p_item_price THEN
    RAISE EXCEPTION 'Insufficient PetPoints';
  END IF;

  -- Deduct points first
  UPDATE profiles
  SET pet_points = pet_points - p_item_price
  WHERE id = p_user_id;

  -- Add to inventory (increment if exists)
  INSERT INTO inventory (user_id, item_id, quantity)
  VALUES (p_user_id, p_item_id, 1)
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET quantity = inventory.quantity + 1
  RETURNING id INTO v_inventory_id;

  RETURN json_build_object('success', true, 'inventory_id', v_inventory_id);
END;
$$;

-- Fix 3: Add search_path to existing functions that are missing it
CREATE OR REPLACE FUNCTION public.assign_daily_quests_to_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- Fix 4: Add message length constraint
ALTER TABLE public.messages 
ADD CONSTRAINT message_length_check 
CHECK (length(content) <= 500 AND length(content) > 0);

-- Fix 5: Create leaderboard view for public data
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  id,
  username,
  pet_points,
  RANK() OVER (ORDER BY pet_points DESC) as rank
FROM profiles
ORDER BY pet_points DESC
LIMIT 100;

-- Grant access to authenticated users
GRANT SELECT ON public.leaderboard TO authenticated;

-- Fix 6: Restrict profiles table to owner-only reads
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Create policy for leaderboard-related profile viewing through the view only
-- Users can still see other profiles through the leaderboard view