import { NextRequest, NextResponse } from 'next/server'
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
        const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }
        return { id: decoded.userId, email: decoded.email }
    } catch {
        return null
    }
}

// Helper function to create size comparison references
function generateSizeReference(dimensions: { width?: string; length?: string; depth?: string; unit?: string } | null) {
    if (!dimensions) return ''

    const { width, length, depth, unit = 'cm' } = dimensions
    const w = parseFloat(width || '0')
    const l = parseFloat(length || '0')
    const d = parseFloat(depth || '0')

    // Convert to cm for comparison
    let wCm = w, lCm = l, dCm = d
    if (unit === 'in') {
        wCm = w * 2.54
        lCm = l * 2.54
        dCm = d * 2.54
    } else if (unit === 'mm') {
        wCm = w / 10
        lCm = l / 10
        dCm = d / 10
    }

    // Generate relatable size comparisons
    const volume = wCm * lCm * dCm
    let sizeComparison = ''

    if (volume < 20) {
        sizeComparison = 'smaller than a matchbox'
    } else if (volume < 100) {
        sizeComparison = 'about the size of a small jewelry box'
    } else if (volume < 500) {
        sizeComparison = 'roughly the size of a smartphone'
    } else if (volume < 1000) {
        sizeComparison = 'about the size of a paperback book'
    } else if (volume < 2000) {
        sizeComparison = 'roughly the size of a tablet device'
    } else {
        sizeComparison = 'larger than a standard book'
    }

    // Determine if it's palm-sized, handheld, etc.
    const maxDimension = Math.max(wCm, lCm, dCm)
    let handReference = ''

    if (maxDimension < 5) {
        handReference = 'easily fits between thumb and finger'
    } else if (maxDimension < 10) {
        handReference = 'fits comfortably in the palm'
    } else if (maxDimension < 15) {
        handReference = 'requires a full hand grip'
    } else {
        handReference = 'requires both hands to hold properly'
    }

    return `The product is ${sizeComparison} and ${handReference}.`
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

        // Generate size reference for better consistency
        const sizeReference = generateSizeReference(product_details.physical_dimensions)

        // Generate 5 optimized Runway ML prompt variations
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert prompt engineer specializing in AI image generation for Runway ML. Create detailed, specific prompts that will generate high-quality commercial photography with creative variations. Pay special attention to product scale and proportions relative to human subjects."
                },
                {
                    role: "user",
                    content: `Create 5 different optimized Runway ML prompt variations based on this selected photoshoot scene:

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
${product_details.physical_dimensions ? `- Dimensions: ${product_details.physical_dimensions.width}x${product_details.physical_dimensions.length}x${product_details.physical_dimensions.depth} ${product_details.physical_dimensions.unit || 'cm'}` : ''}
${sizeReference ? `- Size Reference: ${sizeReference}` : ''}

**Configuration:**
- Type: ${photoshoot_type}
- Style: ${photoshoot_style}
- ${modelContext}

**Critical Requirements for Product Scale Consistency:**
Generate 5 distinct prompt variations that:
1. Always reference the product using its @tag (@${product_details.tag}) throughout the prompt - never use the plain product name
${model_details ? `2. Always reference the model using their @tag (@${model_details.tag}) throughout the prompt - never use the plain model name` : '2. Focus entirely on the product without human subjects'}
3. Each variation should have different angles, poses, lighting nuances, or compositional elements
4. All should maintain the same core scene and mood but with creative differences
5. Specify camera settings and photographic style for each
6. Emphasize commercial quality and ${photoshoot_style} aesthetic
7. Are optimized for photorealistic AI generation
8. Use @tag references consistently for both product and model mentions

**CRITICAL SCALE INSTRUCTIONS:**
${product_details.physical_dimensions ? `- The product @${product_details.tag} measures exactly ${product_details.physical_dimensions.width}x${product_details.physical_dimensions.length}x${product_details.physical_dimensions.depth} ${product_details.physical_dimensions.unit || 'cm'}` : ''}
${sizeReference ? `- Scale reference: ${sizeReference}` : ''}
${model_details ? `- Ensure @${product_details.tag} maintains realistic proportions when held by @${model_details.tag}` : ''}
- The product size must remain consistent across all variations
- Pay attention to hand-to-product size ratios
- Consider the product's actual dimensions when describing how it's held or positioned

IMPORTANT: Every time you mention the product, use @${product_details.tag} (not "${product_details.name}"). ${model_details ? `Every time you mention the model, use @${model_details.tag} (not "${model_details.name}").` : ''}

Format as exactly 5 numbered prompts, each as a single paragraph, maximum 200 words per prompt, with clear @tag references throughout.

Example format:
1. [First variation prompt with scale considerations]
2. [Second variation prompt with scale considerations]
3. [Third variation prompt with scale considerations]
4. [Fourth variation prompt with scale considerations]
5. [Fifth variation prompt with scale considerations]`
                }
            ],
            max_tokens: 1800,
            temperature: 0.7
        })

        const promptResponse = completion.choices[0].message.content

        // Parse the 5 prompts from the response
        const promptLines = promptResponse?.split('\n').filter(line => line.trim().match(/^\d+\./))
        const finalPrompts = promptLines?.map(line => line.replace(/^\d+\.\s*/, '').trim()) || []

        if (finalPrompts.length !== 5) {
            throw new Error('Failed to generate exactly 5 prompt variations')
        }

        console.log('Generated 5 final prompt variations:', finalPrompts.map((p, i) => `${i + 1}: ${p.substring(0, 100)}...`))

        // Prepare reference images array for Runway ML
        const referenceImages = [product_details.image_url]
        const referenceTags = [`@${product_details.tag}`]

        if (model_details && photoshoot_type === 'with_model') {
            referenceImages.push(model_details.image_url)
            referenceTags.push(`@${model_details.tag}`)
        }

        return NextResponse.json({
            success: true,
            final_prompts: finalPrompts,
            reference_images: referenceImages,
            reference_tags: referenceTags,
            scene_title: selected_scene.title,
            ready_for_generation: true,
            size_reference: sizeReference // Include for frontend display
        })

    } catch (error) {
        console.error('Error generating final prompt:', error)
        return NextResponse.json({
            error: 'Failed to generate final prompt',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 