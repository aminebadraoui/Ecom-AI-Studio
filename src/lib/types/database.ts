export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    credits: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    credits?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    credits?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    category: string | null
                    image_url: string
                    dimensions: Json
                    ai_description: string | null
                    metadata: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    category?: string | null
                    image_url: string
                    dimensions: Json
                    ai_description?: string | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    category?: string | null
                    image_url?: string
                    dimensions?: Json
                    ai_description?: string | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            models: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    image_url: string | null
                    characteristics: Json
                    is_ai_generated: boolean
                    usage_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    image_url?: string | null
                    characteristics: Json
                    is_ai_generated?: boolean
                    usage_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    image_url?: string | null
                    characteristics?: Json
                    is_ai_generated?: boolean
                    usage_count?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            photoshoots: {
                Row: {
                    id: string
                    user_id: string
                    product_id: string
                    model_id: string | null
                    style_type: 'professional' | 'ugc'
                    scene_description: string
                    ai_suggested: boolean
                    generation_settings: Json
                    status: 'pending' | 'processing' | 'completed' | 'failed'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    product_id: string
                    model_id?: string | null
                    style_type: 'professional' | 'ugc'
                    scene_description: string
                    ai_suggested?: boolean
                    generation_settings?: Json
                    status?: 'pending' | 'processing' | 'completed' | 'failed'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    product_id?: string
                    model_id?: string | null
                    style_type?: 'professional' | 'ugc'
                    scene_description?: string
                    ai_suggested?: boolean
                    generation_settings?: Json
                    status?: 'pending' | 'processing' | 'completed' | 'failed'
                    created_at?: string
                    updated_at?: string
                }
            }
            generated_photos: {
                Row: {
                    id: string
                    photoshoot_id: string
                    image_url: string
                    thumbnail_url: string | null
                    generation_prompt: string
                    generation_metadata: Json | null
                    download_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    photoshoot_id: string
                    image_url: string
                    thumbnail_url?: string | null
                    generation_prompt: string
                    generation_metadata?: Json | null
                    download_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    photoshoot_id?: string
                    image_url?: string
                    thumbnail_url?: string | null
                    generation_prompt?: string
                    generation_metadata?: Json | null
                    download_count?: number
                    created_at?: string
                }
            }
            credit_transactions: {
                Row: {
                    id: string
                    user_id: string
                    amount: number
                    transaction_type: 'purchase' | 'usage' | 'refund'
                    description: string
                    reference_id: string | null
                    stripe_payment_intent_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount: number
                    transaction_type: 'purchase' | 'usage' | 'refund'
                    description: string
                    reference_id?: string | null
                    stripe_payment_intent_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number
                    transaction_type?: 'purchase' | 'usage' | 'refund'
                    description?: string
                    reference_id?: string | null
                    stripe_payment_intent_id?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Model = Database['public']['Tables']['models']['Row']
export type Photoshoot = Database['public']['Tables']['photoshoots']['Row']
export type GeneratedPhoto = Database['public']['Tables']['generated_photos']['Row']
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'] 