# AI Model Generation Setup

This document explains how to set up the required API keys for AI model generation using OpenAI and Replicate.

## Required Environment Variables

Add these to your `.env.local` file:

### OpenAI Configuration
```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Purpose:** Used to generate detailed prompts from user-provided characteristics.
**How to get:** Sign up at [OpenAI Platform](https://platform.openai.com/) and create an API key.

### Replicate Configuration
```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

**Purpose:** Used to access Google's Imagen-4 model (via `google/imagen-4`) for generating realistic model faces.
**How to get:** Sign up at [Replicate](https://replicate.com/) and create an API token.

### Existing Configuration
Make sure these are already configured (should be from your existing setup):

```env
# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Supabase (for database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Flow Overview

1. **User Input:** User fills out characteristics form (gender, age, hair color, etc.)
2. **Prompt Generation:** OpenAI GPT-4 converts characteristics into a detailed Imagen-4 prompt
3. **Image Generation:** Replicate runs Google's Imagen-4 model (`google/imagen-4`) with the generated prompt
4. **Storage:** Generated image is uploaded to Cloudinary and model data saved to Supabase
5. **Credits:** 3 credits are deducted from user's account

## Model Configuration

**Image Settings:**
- **Aspect Ratio:** 1:1 (square format for portraits)  
- **Safety Filter:** Medium and above blocking
- **Output:** Single high-quality image URL

## Costs

- **OpenAI:** ~$0.01-0.03 per prompt generation (GPT-4)
- **Replicate:** ~$0.10-0.50 per image generation (Imagen-4 via `google/imagen-4`)
- **Total per generation:** ~$0.11-0.53

## Testing

1. Ensure all environment variables are set
2. Restart your development server: `npm run dev`
3. Navigate to `/models/new` → "AI Generation"
4. Fill out the characteristics form
5. Click "Generate Model (3 Credits)"

## Error Handling

The system includes comprehensive error handling for:
- Missing API keys
- Insufficient credits
- Rate limiting
- Network failures
- Database errors
- Image upload failures

If generation fails, credits will not be deducted and any partial uploads will be cleaned up.

## Troubleshooting

**Common Issues:**

1. **404 Model Not Found:** Ensure you're using the correct Replicate model `google/imagen-4`
2. **Authentication Failed:** Check your `REPLICATE_API_TOKEN` is valid
3. **Rate Limiting:** Replicate has usage limits - wait before retrying
4. **Safety Filter:** Some prompts may be blocked - try adjusting characteristics 