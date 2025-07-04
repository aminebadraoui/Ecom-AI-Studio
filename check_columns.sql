-- Diagnostic query to check what columns exist in your database
-- Run this in Supabase SQL Editor to see current table structure

-- Check products table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check models table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'models' 
ORDER BY ordinal_position;

-- Check if photoshoots table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'photoshoots' 
ORDER BY ordinal_position; 