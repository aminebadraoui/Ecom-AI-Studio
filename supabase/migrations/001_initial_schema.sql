-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    credits INTEGER DEFAULT 5, -- 5 free trial credits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    image_url TEXT NOT NULL,
    dimensions JSONB NOT NULL, -- {width: number, height: number, depth: number, unit: string}
    ai_description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create models table
CREATE TABLE models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    characteristics JSONB NOT NULL, -- {gender, age, hair_color, eye_color, height, body_type, ethnicity}
    is_ai_generated BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photoshoots table
CREATE TABLE photoshoots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    model_id UUID REFERENCES models(id) ON DELETE SET NULL,
    style_type TEXT NOT NULL CHECK (style_type IN ('professional', 'ugc')),
    scene_description TEXT NOT NULL,
    ai_suggested BOOLEAN DEFAULT false,
    generation_settings JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_photos table
CREATE TABLE generated_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    photoshoot_id UUID REFERENCES photoshoots(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    generation_prompt TEXT NOT NULL,
    generation_metadata JSONB DEFAULT '{}',
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_transactions table
CREATE TABLE credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- positive for purchases, negative for usage
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund')),
    description TEXT NOT NULL,
    reference_id UUID, -- can reference photoshoot_id or product_id
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_models_user_id ON models(user_id);
CREATE INDEX idx_photoshoots_user_id ON photoshoots(user_id);
CREATE INDEX idx_photoshoots_product_id ON photoshoots(product_id);
CREATE INDEX idx_photoshoots_status ON photoshoots(status);
CREATE INDEX idx_generated_photos_photoshoot_id ON generated_photos(photoshoot_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE photoshoots ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Users can view own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- Models policies
CREATE POLICY "Users can view own models" ON models FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own models" ON models FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own models" ON models FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own models" ON models FOR DELETE USING (auth.uid() = user_id);

-- Photoshoots policies
CREATE POLICY "Users can view own photoshoots" ON photoshoots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own photoshoots" ON photoshoots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own photoshoots" ON photoshoots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own photoshoots" ON photoshoots FOR DELETE USING (auth.uid() = user_id);

-- Generated photos policies (users can only view photos from their photoshoots)
CREATE POLICY "Users can view photos from own photoshoots" ON generated_photos FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM photoshoots 
    WHERE photoshoots.id = generated_photos.photoshoot_id 
    AND photoshoots.user_id = auth.uid()
));

CREATE POLICY "Service role can insert generated photos" ON generated_photos FOR INSERT 
WITH CHECK (true); -- Only service role should insert photos

CREATE POLICY "Users can update download count on own photos" ON generated_photos FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM photoshoots 
    WHERE photoshoots.id = generated_photos.photoshoot_id 
    AND photoshoots.user_id = auth.uid()
));

-- Credit transactions policies
CREATE POLICY "Users can view own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert transactions" ON credit_transactions FOR INSERT WITH CHECK (true);

-- Create functions for common operations

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update credits
CREATE OR REPLACE FUNCTION update_user_credits(
    user_id_param UUID,
    amount_param INTEGER,
    transaction_type_param TEXT,
    description_param TEXT,
    reference_id_param UUID DEFAULT NULL,
    stripe_payment_intent_id_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    -- Get current credits
    SELECT credits INTO current_credits FROM profiles WHERE id = user_id_param;
    
    -- Check if user has enough credits for usage transactions
    IF transaction_type_param = 'usage' AND (current_credits + amount_param) < 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Update credits
    UPDATE profiles 
    SET credits = credits + amount_param, updated_at = NOW()
    WHERE id = user_id_param;
    
    -- Record transaction
    INSERT INTO credit_transactions (
        user_id, amount, transaction_type, description, reference_id, stripe_payment_intent_id
    ) VALUES (
        user_id_param, amount_param, transaction_type_param, description_param, 
        reference_id_param, stripe_payment_intent_id_param
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment model usage
CREATE OR REPLACE FUNCTION increment_model_usage(model_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE models 
    SET usage_count = usage_count + 1, updated_at = NOW()
    WHERE id = model_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment photo download count
CREATE OR REPLACE FUNCTION increment_download_count(photo_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE generated_photos 
    SET download_count = download_count + 1
    WHERE id = photo_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 