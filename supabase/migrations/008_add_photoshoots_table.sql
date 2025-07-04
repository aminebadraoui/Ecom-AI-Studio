-- Migration 008: Add photoshoots table
-- Create photoshoots table for AI-powered photoshoot generation system

CREATE TABLE IF NOT EXISTS photoshoots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic photoshoot info
    name VARCHAR(255) NOT NULL,
    
    -- Photoshoot configuration
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    model_id UUID REFERENCES models(id) ON DELETE SET NULL, -- NULL for product-only photoshoots
    
    -- Photoshoot type and style
    type VARCHAR(20) NOT NULL CHECK (type IN ('product_only', 'with_model')),
    style VARCHAR(20) NOT NULL CHECK (style IN ('professional', 'lifestyle', 'artistic', 'commercial')),
    
    -- AI-generated content
    product_description TEXT, -- AI-generated product description from image analysis
    photoshoot_ideas JSONB, -- Array of AI-generated photoshoot ideas
    selected_idea_index INTEGER, -- Index of the selected idea from the array
    
    -- Prompt and generation
    final_prompt TEXT, -- The final prompt for image generation
    reference_images TEXT[], -- Array of image URLs for reference
    reference_tags TEXT[], -- Array of tags corresponding to reference images
    
    -- Generated results
    generated_image_url TEXT, -- The resulting image URL
    generation_status VARCHAR(20) DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
    generation_error TEXT, -- Error message if generation failed
    
    -- Credits and billing
    credits_used INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photoshoots_user_id ON photoshoots(user_id);
CREATE INDEX IF NOT EXISTS idx_photoshoots_product_id ON photoshoots(product_id);
CREATE INDEX IF NOT EXISTS idx_photoshoots_model_id ON photoshoots(model_id);
CREATE INDEX IF NOT EXISTS idx_photoshoots_type ON photoshoots(type);
CREATE INDEX IF NOT EXISTS idx_photoshoots_style ON photoshoots(style);
CREATE INDEX IF NOT EXISTS idx_photoshoots_status ON photoshoots(generation_status);
CREATE INDEX IF NOT EXISTS idx_photoshoots_created_at ON photoshoots(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_photoshoots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_photoshoots_updated_at
    BEFORE UPDATE ON photoshoots
    FOR EACH ROW
    EXECUTE FUNCTION update_photoshoots_updated_at(); 