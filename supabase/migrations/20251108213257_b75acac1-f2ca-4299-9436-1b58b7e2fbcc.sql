-- Add max_pets limit to profiles
ALTER TABLE public.profiles
ADD COLUMN max_pets integer NOT NULL DEFAULT 10;

-- Update purchase_marketplace_pet to check roster space
CREATE OR REPLACE FUNCTION public.purchase_marketplace_pet(p_listing_id uuid, p_buyer_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing RECORD;
  v_buyer_points INTEGER;
  v_buyer_pet_count INTEGER;
  v_buyer_max_pets INTEGER;
  v_marketplace_fee INTEGER;
  v_seller_amount INTEGER;
BEGIN
  -- Lock and get listing
  SELECT * INTO v_listing
  FROM marketplace_listings
  WHERE id = p_listing_id AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or not active';
  END IF;

  IF v_listing.seller_id = p_buyer_id THEN
    RAISE EXCEPTION 'Cannot buy your own listing';
  END IF;

  -- Lock buyer profile and get pet count
  SELECT pet_points, max_pets INTO v_buyer_points, v_buyer_max_pets
  FROM profiles
  WHERE id = p_buyer_id
  FOR UPDATE;

  -- Count buyer's current pets
  SELECT COUNT(*) INTO v_buyer_pet_count
  FROM pets
  WHERE owner_id = p_buyer_id;

  -- Check roster space
  IF v_buyer_pet_count >= v_buyer_max_pets THEN
    RAISE EXCEPTION 'Not enough roster space';
  END IF;

  IF v_buyer_points < v_listing.price THEN
    RAISE EXCEPTION 'Insufficient PetPoints';
  END IF;

  -- Calculate marketplace fee (5%)
  v_marketplace_fee := FLOOR(v_listing.price * 0.05);
  v_seller_amount := v_listing.price - v_marketplace_fee;

  -- Transfer pet ownership
  UPDATE pets
  SET owner_id = p_buyer_id
  WHERE id = v_listing.pet_id;

  -- Update buyer points
  UPDATE profiles
  SET pet_points = pet_points - v_listing.price
  WHERE id = p_buyer_id;

  -- Update seller points
  UPDATE profiles
  SET pet_points = pet_points + v_seller_amount
  WHERE id = v_listing.seller_id;

  -- Mark listing as sold
  UPDATE marketplace_listings
  SET status = 'sold',
      sold_at = NOW()
  WHERE id = p_listing_id;

  -- Log transfer
  INSERT INTO pet_transfers (
    pet_id, from_user_id, to_user_id, 
    transfer_type, price, marketplace_listing_id
  ) VALUES (
    v_listing.pet_id, v_listing.seller_id, p_buyer_id,
    'marketplace', v_listing.price, p_listing_id
  );

  RETURN json_build_object('success', true, 'pet_id', v_listing.pet_id);
END;
$$;

-- Create function to list pet on marketplace (with 50 PP fee)
CREATE OR REPLACE FUNCTION public.list_pet_on_marketplace(
  p_user_id uuid,
  p_pet_id uuid,
  p_price integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_points INTEGER;
  v_listing_fee INTEGER := 50;
  v_listing_id UUID;
BEGIN
  -- Check if pet belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM pets 
    WHERE id = p_pet_id AND owner_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Pet not found or does not belong to you';
  END IF;

  -- Check if pet is already listed
  IF EXISTS (
    SELECT 1 FROM marketplace_listings 
    WHERE pet_id = p_pet_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Pet is already listed on marketplace';
  END IF;

  -- Lock user's profile
  SELECT pet_points INTO v_current_points
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check sufficient funds for listing fee
  IF v_current_points < v_listing_fee THEN
    RAISE EXCEPTION 'Insufficient PetPoints for listing fee';
  END IF;

  -- Deduct listing fee
  UPDATE profiles
  SET pet_points = pet_points - v_listing_fee
  WHERE id = p_user_id;

  -- Create listing
  INSERT INTO marketplace_listings (seller_id, pet_id, price, status)
  VALUES (p_user_id, p_pet_id, p_price, 'active')
  RETURNING id INTO v_listing_id;

  RETURN json_build_object('success', true, 'listing_id', v_listing_id);
END;
$$;