-- Create marketplace_listings table
CREATE TABLE public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sold_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_active_pet_listing UNIQUE (pet_id, status)
);

-- Enable RLS on marketplace_listings
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_listings
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can create their own listings"
ON public.marketplace_listings
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings"
ON public.marketplace_listings
FOR UPDATE
USING (auth.uid() = seller_id);

-- Create trade_offers table
CREATE TABLE public.trade_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offerer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  offerer_pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Enable RLS on trade_offers
ALTER TABLE public.trade_offers ENABLE ROW LEVEL SECURITY;

-- RLS policies for trade_offers
CREATE POLICY "Users can view their trade offers"
ON public.trade_offers
FOR SELECT
USING (auth.uid() = offerer_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create trade offers"
ON public.trade_offers
FOR INSERT
WITH CHECK (auth.uid() = offerer_id);

CREATE POLICY "Offerers can update their offers"
ON public.trade_offers
FOR UPDATE
USING (auth.uid() = offerer_id OR auth.uid() = recipient_id);

-- Create pet_transfers table for logging
CREATE TABLE public.pet_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('trade', 'marketplace', 'gift')),
  price INTEGER,
  trade_offer_id UUID REFERENCES public.trade_offers(id) ON DELETE SET NULL,
  marketplace_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on pet_transfers
ALTER TABLE public.pet_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policy for pet_transfers
CREATE POLICY "Users can view their transfers"
ON public.pet_transfers
FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Function to purchase from marketplace
CREATE OR REPLACE FUNCTION public.purchase_marketplace_pet(
  p_listing_id UUID,
  p_buyer_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing RECORD;
  v_buyer_points INTEGER;
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

  -- Lock buyer profile
  SELECT pet_points INTO v_buyer_points
  FROM profiles
  WHERE id = p_buyer_id
  FOR UPDATE;

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

-- Function to accept trade offer
CREATE OR REPLACE FUNCTION public.accept_trade_offer(
  p_offer_id UUID,
  p_recipient_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer RECORD;
BEGIN
  -- Lock and get offer
  SELECT * INTO v_offer
  FROM trade_offers
  WHERE id = p_offer_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trade offer not found or not pending';
  END IF;

  IF v_offer.recipient_id != p_recipient_id THEN
    RAISE EXCEPTION 'Not authorized to accept this offer';
  END IF;

  IF v_offer.expires_at < NOW() THEN
    RAISE EXCEPTION 'Trade offer has expired';
  END IF;

  -- Swap pet ownership
  UPDATE pets SET owner_id = v_offer.recipient_id WHERE id = v_offer.offerer_pet_id;
  UPDATE pets SET owner_id = v_offer.offerer_id WHERE id = v_offer.recipient_pet_id;

  -- Mark offer as accepted
  UPDATE trade_offers
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_offer_id;

  -- Log both transfers
  INSERT INTO pet_transfers (pet_id, from_user_id, to_user_id, transfer_type, trade_offer_id)
  VALUES 
    (v_offer.offerer_pet_id, v_offer.offerer_id, v_offer.recipient_id, 'trade', p_offer_id),
    (v_offer.recipient_pet_id, v_offer.recipient_id, v_offer.offerer_id, 'trade', p_offer_id);

  RETURN json_build_object('success', true);
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_seller ON public.marketplace_listings(seller_id);
CREATE INDEX idx_trade_offers_status ON public.trade_offers(status);
CREATE INDEX idx_trade_offers_offerer ON public.trade_offers(offerer_id);
CREATE INDEX idx_trade_offers_recipient ON public.trade_offers(recipient_id);

-- Create triggers for updated_at
CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trade_offers_updated_at
BEFORE UPDATE ON public.trade_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();