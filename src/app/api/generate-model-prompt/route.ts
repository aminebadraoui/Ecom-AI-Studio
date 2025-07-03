import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/custom-auth'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

interface Characteristics {
    modelName: string
    gender: string
    age: string
    ethnicity: string
    hairColor: string
    hairStyle: string
    eyeColor: string
    skinTone: string
    expression: string
    additional: string
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate the user
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
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }

        // Get user from database
        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const { characteristics }: { characteristics: Characteristics } = await request.json()

        if (!characteristics) {
            return NextResponse.json(
                { error: 'Characteristics are required' },
                { status: 400 }
            )
        }

        // Create a detailed prompt for Imagen-4
        const systemPrompt = `You are an expert AI prompt engineer specializing in creating detailed, photorealistic portrait descriptions for Google's Imagen-4 model. Your task is to convert user-provided characteristics into a comprehensive, professional prompt that will generate a high-quality close-up portrait suitable for commercial photography.

Guidelines:
- Focus on photorealistic, professional headshot/portrait style
- Include technical photography details (lighting, composition, quality)
- Ensure the description is suitable for product/commercial photography
- Maintain professional and respectful language
- Include details about lighting, background, and overall aesthetic
- The result should be a single, well-structured paragraph prompt`

        const userPrompt = `Create a detailed Imagen-4 prompt for a ${characteristics.age} year old ${characteristics.gender} model with the following characteristics:

- Ethnicity: ${characteristics.ethnicity}
- Hair color: ${characteristics.hairColor}${characteristics.hairStyle ? ` (${characteristics.hairStyle})` : ''}
- Eye color: ${characteristics.eyeColor}
- Skin tone: ${characteristics.skinTone}
- Expression: ${characteristics.expression || 'neutral, professional'}
${characteristics.additional ? `- Additional details: ${characteristics.additional}` : ''}

The image should be:
- A professional close-up portrait/headshot
- Well-lit with soft, even lighting
- Clean, neutral background
- High resolution and photorealistic
- Suitable for commercial/product photography use
- Professional modeling pose

Generate a single comprehensive prompt that Imagen-4 can use to create this model portrait.`

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
        })

        const prompt = completion.choices[0]?.message?.content

        if (!prompt) {
            return NextResponse.json(
                { error: 'Failed to generate prompt' },
                { status: 500 }
            )
        }

        console.log('Generated prompt:', prompt)

        return NextResponse.json({
            success: true,
            prompt: prompt.trim(),
            characteristics
        })

    } catch (error) {
        console.error('Error generating prompt:', error)

        if (error instanceof Error && error.message.includes('API key')) {
            return NextResponse.json(
                { error: 'OpenAI API configuration error. Please check your API key.' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 