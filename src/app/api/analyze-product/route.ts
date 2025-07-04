import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/custom-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

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

        const { product_id } = await request.json()

        if (!product_id) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            )
        }

        // Get product details from database
        const { data: product, error: productError } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', product_id)
            .eq('user_id', user.id)
            .single()

        if (productError || !product) {
            return NextResponse.json(
                { error: 'Product not found or unauthorized' },
                { status: 404 }
            )
        }

        console.log('Analyzing product with image URL:', product.image_url)

        // Analyze the product image using GPT-4 Vision
        const analysis = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this product image and provide a detailed description for AI photoshoot generation. Include:

1. Product type and category
2. Colors, materials, and textures
3. Size and dimensions (visual estimate)
4. Style characteristics (modern, vintage, luxury, etc.)
5. Key selling points and features
6. Target audience and use cases
7. Photoshoot potential and recommendations

Provide a comprehensive description that will help generate creative photoshoot scenes.`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: product.image_url
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        })

        const productDescription = analysis.choices[0].message.content

        console.log('Product analysis completed:', productDescription)

        return NextResponse.json({
            success: true,
            analysis: productDescription,
            product: {
                id: product.id,
                name: product.name,
                image_url: product.image_url
            }
        })

    } catch (error) {
        console.error('Analyze product API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 