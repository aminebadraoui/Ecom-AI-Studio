# Supabase Setup Guide

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ecom-photo-studio`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get API Keys
Once your project is ready:
1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**
   - **anon/public key** 
   - **service_role key** (keep this secret!)

### 3. Configure Environment Variables
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration (for payments - add later)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 4. Run Database Migration
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL to create all tables and functions

### 5. Configure Storage (for image uploads)
1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `product-images`
3. Make it **public** for read access
4. Create another bucket named `generated-photos` (also public)
5. Create bucket named `model-photos` (also public)

### 6. Test the Connection
1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3001/api/test-db`
3. You should see a success message

## 📋 Database Schema Overview

### Tables Created:
- **profiles** - User profiles with credit tracking
- **products** - Uploaded product information
- **models** - User-created or AI-generated models
- **photoshoots** - Photoshoot configurations and settings
- **generated_photos** - AI-generated images
- **credit_transactions** - Credit purchase/usage history

### Key Features:
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic user profile creation on signup
- ✅ Credit management with transaction tracking
- ✅ Optimized indexes for performance
- ✅ Helper functions for common operations

## 🔒 Security Features

- **Row Level Security**: Users can only access their own data
- **Service Role Functions**: Sensitive operations use service role
- **Automatic Profile Creation**: New users get profiles automatically
- **Credit Validation**: Prevents negative credit balances

## 🧪 Testing

The integration includes:
- API test endpoint at `/api/test-db`
- Authentication utilities in `src/lib/auth.ts`
- Type-safe database operations with TypeScript
- Comprehensive error handling

## 📚 Next Steps

After completing this setup:
1. Test user registration and login
2. Implement product upload functionality
3. Set up file storage for images
4. Integrate AI services for descriptions
5. Add Stripe for payments

## 🆘 Troubleshooting

### Common Issues:

**Environment Variables Not Found**
- Ensure `.env.local` exists in project root
- Restart development server after adding variables
- Check variable names match exactly

**Database Connection Failed**
- Verify Supabase project URL and keys
- Check if project is active (not paused)
- Ensure database migration was run successfully

**Authentication Issues**
- Verify RLS policies are enabled
- Check auth configuration in Supabase dashboard
- Ensure email confirmation is set up if required

### Support
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Community: [Discord](https://discord.supabase.com/)
- GitHub issues for project-specific problems 