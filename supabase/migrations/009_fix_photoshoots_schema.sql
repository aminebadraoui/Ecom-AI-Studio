-- Migration 009: Fix photoshoots schema and add generated_images array
-- This migration aligns the database schema with what's actually being used

-- First, add the generated_image_url column if it doesn't exist
ALTER TABLE photoshoots ADD COLUMN IF NOT EXISTS generated_image_url TEXT;

-- Add the generated_images column to store multiple generated images
ALTER TABLE photoshoots ADD COLUMN IF NOT EXISTS generated_images JSONB DEFAULT '[]'::jsonb;

-- Add index for the generated_images column
CREATE INDEX IF NOT EXISTS idx_photoshoots_generated_images ON photoshoots USING GIN (generated_images);

-- Create a comment to document the generated_images structure
COMMENT ON COLUMN photoshoots.generated_images IS 'Array of generated image objects with URLs, timestamps, and metadata';

-- Update the existing generated_image_url data to the new generated_images array format
-- This will migrate existing single images to the new array format
UPDATE photoshoots 
SET generated_images = jsonb_build_array(
    jsonb_build_object(
        'url', generated_image_url,
        'created_at', updated_at,
        'is_primary', true
    )
)
WHERE generated_image_url IS NOT NULL AND generated_images = '[]'::jsonb;

-- The generated_image_url column will be kept for backward compatibility for now
-- but new code should use the generated_images array 