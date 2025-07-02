-- Comprehensive fix for authentication and profile creation

-- 1. Drop existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Drop existing INSERT policy for profiles
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;

-- 3. Create a more robust trigger function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- This is crucial - allows function to bypass RLS
SET search_path = public, auth
AS $$
BEGIN
    -- Insert profile with error handling
    INSERT INTO public.profiles (id, email, full_name, avatar_url, credits)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.raw_user_meta_data->>'avatar_url',
        5 -- 5 free credits
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- 5. Add proper RLS policies for profiles
-- Allow the trigger function to insert profiles
CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to insert profiles (for the trigger)
CREATE POLICY "Enable insert for service role" ON profiles
    FOR INSERT WITH CHECK (true);

-- 6. Make sure the function has proper grants
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- 7. Test the trigger by attempting to create and immediately delete a test user
-- This will validate that the trigger works correctly
DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT := 'trigger-test-' || extract(epoch from now()) || '@test.com';
BEGIN
    -- This should trigger our function
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        confirmation_token,
        recovery_sent_at,
        recovery_token,
        email_change_sent_at,
        email_change,
        email_change_token_new,
        email_change_token_current,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current_deadline,
        email_change_token_new_deadline
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        test_email,
        crypt('testpass123', gen_salt('bf')),
        now(),
        now(),
        '',
        null,
        '',
        null,
        '',
        '',
        '',
        null,
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Test Trigger User"}',
        false,
        now(),
        now(),
        null,
        null,
        '',
        '',
        null,
        null,
        null
    ) RETURNING id INTO test_user_id;
    
    -- Check if profile was created
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = test_user_id) THEN
        RAISE NOTICE 'SUCCESS: Trigger created profile for test user %', test_user_id;
    ELSE
        RAISE NOTICE 'WARNING: Trigger did not create profile for test user %', test_user_id;
    END IF;
    
    -- Clean up test user and profile
    DELETE FROM public.profiles WHERE id = test_user_id;
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Test user cleaned up successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR during trigger test: %', SQLERRM;
END $$; 