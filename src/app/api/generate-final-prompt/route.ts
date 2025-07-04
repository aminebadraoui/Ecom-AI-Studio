import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verify } from 'jsonwebtoken'
import OpenAI from 'openai'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

async function getAuthenticatedUser(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
        return null
    }

    try {
        const decoded = verify(token, JWT_SECRET) as any
        return { id: decoded.userId, email: decoded.email }
    } catch (error) {
        return null
    }
}

// POST /api/generate-final-prompt - Generate final Runway ML prompt from selected scene
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            selected_scene,
            product_details,
            model_details,
            photoshoot_type,
            photoshoot_style
        } = body

        if (!selected_scene || !product_details) {
            return NextResponse.json({
                error: 'Selected scene and product details are required'
            }, { status: 400 })
        }

        console.log('Generating final prompt for scene:', selected_scene.title)

        const modelContext = model_details ?
            `Model: @${model_details.tag} (${model_details.name})` :
            'Product-only photoshoot'

        // Generate optimized Runway ML prompt
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert prompt engineer specializing in AI image generation for Runway ML. Create detailed, specific prompts that will generate high-quality commercial photography."
                },
                {
                    role: "user",
                    content: `Create an optimized Runway ML prompt based on this selected photoshoot scene:

**Selected Scene:**
- Title: ${selected_scene.title}
- Setting: ${selected_scene.setting}
- Mood: ${selected_scene.mood}
- Lighting: ${selected_scene.lighting}
- Composition: ${selected_scene.composition}
- ${photoshoot_type === 'with_model' ? 'Model Interaction' : 'Product Focus'}: ${selected_scene.model_interaction || selected_scene.product_focus}

**Product Details:**
- Name: ${product_details.name}
- Tag: @${product_details.tag}

**Configuration:**
- Type: ${photoshoot_type}
- Style: ${photoshoot_style}
- ${modelContext}

**Requirements:**
Generate a single, comprehensive Runway ML prompt that:
1. Always references the product using its @tag (@${product_details.tag}) throughout the prompt - never use the plain product name
${model_details ? `2. Always references the model using their @tag (@${model_details.tag}) throughout the prompt - never use the plain model name` : '2. Focuses entirely on the product without human subjects'}
3. Describes the exact scene, lighting, and composition
4. Specifies camera settings and photographic style
5. Emphasizes commercial quality and ${photoshoot_style} aesthetic
6. Is optimized for photorealistic AI generation
7. Uses @tag references consistently for both product and model mentions

IMPORTANT: Every time you mention the product, use @${product_details.tag} (not "${product_details.name}"). ${model_details ? `Every time you mention the model, use @${model_details.tag} (not "${model_details.name}").` : ''}

Format as a single paragraph prompt, maximum 200 words, with clear @tag references throughout.`
                }
            ],
            max_tokens: 300,
            temperature: 0.7
        })

        const finalPrompt = completion.choices[0].message.content

        console.log('Generated final prompt:', finalPrompt)

        // Prepare reference images array for Runway ML
        const referenceImages = [product_details.image_url]
        const referenceTags = [`@${product_details.tag}`]

        if (model_details && photoshoot_type === 'with_model') {
            referenceImages.push(model_details.image_url)
            referenceTags.push(`@${model_details.tag}`)
        }

        return NextResponse.json({
            success: true,
            final_prompt: finalPrompt,
            reference_images: referenceImages,
            reference_tags: referenceTags,
            scene_title: selected_scene.title,
            ready_for_generation: true
        })

    } catch (error) {
        console.error('Error generating final prompt:', error)
        return NextResponse.json({
            error: 'Failed to generate final prompt',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 