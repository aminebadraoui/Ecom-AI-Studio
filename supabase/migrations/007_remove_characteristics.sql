-- Migration 007: Remove characteristics column from models table
-- The characteristics field is only used for AI prompting, not for storage

-- Remove the characteristics column if it exists
ALTER TABLE models DROP COLUMN IF EXISTS characteristics;

-- Ensure all required columns exist with correct types
ALTER TABLE models ADD COLUMN IF NOT EXISTS dimensions JSONB;
ALTER TABLE models ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE models ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE models ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);
CREATE INDEX IF NOT EXISTS idx_models_tag ON models(tag);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at);

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION update_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS trigger_update_models_updated_at ON models;
CREATE TRIGGER trigger_update_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW
    EXECUTE FUNCTION update_models_updated_at(); 