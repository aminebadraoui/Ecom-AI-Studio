import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/custom-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// POST /api/generate-scene-ideas - Generate creative photoshoot scene ideas
export async function POST(request: NextRequest) {
    try {
        // Authenticate the user using the same pattern as other API routes
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No authentication token found' },
                { status: 401 }
            )
        }

        // Verify token
        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid authentication token' },
                { status: 401 }
            )
        }

        // Get user
        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            product_analysis,
            product_details,
            model_details,
            photoshoot_type,
            photoshoot_style
        } = body

        if (!product_analysis || !photoshoot_type || !photoshoot_style) {
            return NextResponse.json({
                error: 'Product analysis, photoshoot type, and style are required'
            }, { status: 400 })
        }

        console.log('Generating scene ideas for:', product_details?.name)

        const modelContext = model_details ?
            `Model details: ${model_details.name} (${model_details.tag})` :
            'No model selected (product-only photoshoot)'

        // Generate scene ideas with GPT-4o
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert creative director specializing in product photography and photoshoot concepts. Generate diverse, creative, and commercially viable photoshoot scene ideas."
                },
                {
                    role: "user",
                    content: `Based on this product analysis, generate 5 creative photoshoot scene ideas:

**Product Analysis:**
${product_analysis}

**Photoshoot Configuration:**
- Type: ${photoshoot_type}
- Style: ${photoshoot_style}
- ${modelContext}

**Requirements:**
Generate exactly 5 distinct scene ideas. For each scene, provide:
1. **Scene Title:** A catchy, descriptive name
2. **Setting:** Detailed environment/location description
3. **Mood:** Overall atmosphere and feeling
4. **Lighting:** Specific lighting setup and style
5. **Composition:** Camera angles, positioning, and framing
${photoshoot_type === 'with_model' ? '6. **Model Interaction:** How the model should interact with the product' : '6. **Product Focus:** How to highlight the product\'s key features'}
7. **Description:** Brief explanation of commercial appeal

Format as JSON array with this structure:
[
    {
        "title": "Scene Title",
        "setting": "Detailed setting description",
        "mood": "Mood description",
        "lighting": "Lighting setup",
        "composition": "Camera and framing details",
        "${photoshoot_type === 'with_model' ? 'model_interaction' : 'product_focus'}": "Interaction/focus details",
        "description": "Why this scene works"
    }
]

Ensure scenes are diverse, creative, and appropriate for ${photoshoot_style} style photography.`
                }
            ],
            max_tokens: 1500,
            temperature: 0.8
        })

        const responseContent = completion.choices[0].message.content

        try {
            // Clean the response content to handle markdown code blocks
            let cleanedContent = responseContent || '[]'

            // Remove markdown code blocks if present
            if (cleanedContent.includes('```json')) {
                cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
            } else if (cleanedContent.includes('```')) {
                cleanedContent = cleanedContent.replace(/```\s*/g, '').replace(/```\s*$/g, '')
            }

            // Parse the JSON response
            const sceneIdeas = JSON.parse(cleanedContent.trim())

            if (!Array.isArray(sceneIdeas) || sceneIdeas.length === 0) {
                throw new Error('Invalid scene ideas format')
            }

            console.log('Generated scene ideas:', sceneIdeas.length, 'scenes')

            return NextResponse.json({
                success: true,
                scene_ideas: sceneIdeas,
                total_scenes: sceneIdeas.length
            })

        } catch (parseError) {
            console.error('Error parsing scene ideas:', parseError)
            console.log('Raw response:', responseContent)

            // Fallback: return empty array instead of text
            return NextResponse.json({
                success: false,
                error: 'Failed to parse scene ideas',
                scene_ideas: [],
                details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
            }, { status: 500 })
        }

    } catch (error) {
        console.error('Error generating scene ideas:', error)
        return NextResponse.json({
            error: 'Failed to generate scene ideas',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 