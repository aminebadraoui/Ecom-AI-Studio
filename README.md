# Ecom Photo Studio

An AI-powered ecommerce photo studio built with Next.js, featuring product analysis, model management, and AI-generated photoshoots using Runway ML.

## Features

- 🛍️ **Product Management** - Upload and manage product images with Cloudinary CDN
- 🤖 **AI Model Management** - Create and manage AI models for photoshoots
- 🎨 **AI Photoshoot Generation** - Generate professional product photos using Runway ML
- 🔍 **Product Analysis** - AI-powered product analysis for optimized photoshoot prompts
- 💳 **Credit System** - Pay-per-use credit system for AI generations
- 🔐 **Custom Authentication** - Secure user authentication with JWT tokens

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="your-supabase-database-url"
SUPABASE_URL="your-supabase-project-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Authentication
JWT_SECRET="your-jwt-secret-key"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
REPLICATE_API_TOKEN="your-replicate-api-token"

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### Getting API Keys

1. **Replicate API Token**: Sign up at [replicate.com](https://replicate.com) and get your API token from the dashboard
2. **OpenAI API Key**: Get your API key from [platform.openai.com](https://platform.openai.com)
3. **Cloudinary**: Sign up at [cloudinary.com](https://cloudinary.com) and get your credentials
4. **Supabase**: Create a project at [supabase.com](https://supabase.com) and get your credentials

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

1. Create a Supabase project
2. Run the migrations in the `supabase/migrations/` directory in order
3. Set up your environment variables

## AI Models

The application uses:
- **OpenAI GPT-4** for product analysis and prompt generation
- **Runway ML Gen-4** via Replicate for image generation
- **Cloudinary** for image storage and optimization

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
