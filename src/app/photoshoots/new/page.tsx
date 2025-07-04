'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

interface Product {
    id: string
    name: string
    tag: string
    image_url: string
    physical_dimensions?: {
        width: number
        length: number
        depth: number
        unit: string
    }
}

interface Model {
    id: string
    name: string
    tag: string
    image_url: string
}

interface SceneIdea {
    title: string
    setting: string
    mood: string
    lighting: string
    composition: string
    model_interaction?: string
    product_focus?: string
    description: string
}

type WorkflowStep = 'setup' | 'analyzing' | 'scene_ideas' | 'scene_selection' | 'final_prompt' | 'generating' | 'completed' | 'error'

export default function NewPhotoshootPage() {
    const { user } = useAuth()

    // Form data
    const [photoshootName, setPhotoshootName] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [selectedModel, setSelectedModel] = useState<Model | null>(null)
    const [photoshootType, setPhotoshootType] = useState<'product_only' | 'with_model'>('product_only')
    const [photoshootStyle, setPhotoshootStyle] = useState<'professional' | 'lifestyle' | 'artistic' | 'commercial'>('professional')

    // Available options
    const [products, setProducts] = useState<Product[]>([])
    const [models, setModels] = useState<Model[]>([])

    // AI Workflow state
    const [currentStep, setCurrentStep] = useState<WorkflowStep>('setup')
    const [productAnalysis, setProductAnalysis] = useState<string>('')
    const [sceneIdeas, setSceneIdeas] = useState<SceneIdea[]>([])
    const [selectedScene, setSelectedScene] = useState<SceneIdea | null>(null)
    const [finalPrompt, setFinalPrompt] = useState('')
    const [generatedImageUrl, setGeneratedImageUrl] = useState('')
    const [currentPhotoshootId, setCurrentPhotoshootId] = useState<string | null>(null)

    // UI state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Load products and models
    useEffect(() => {
        if (user) {
            Promise.all([
                fetch('/api/products').then(res => res.json()),
                fetch('/api/models').then(res => res.json())
            ]).then(([productsRes, modelsRes]) => {
                if (productsRes.products) setProducts(productsRes.products)
                if (modelsRes.models) setModels(modelsRes.models)
            }).catch(console.error)
        }
    }, [user])

    // Step 1: Analyze Product Image
    const analyzeProduct = async () => {
        if (!selectedProduct) return

        setLoading(true)
        setCurrentStep('analyzing')
        setError('')

        try {
            const response = await fetch('/api/analyze-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: selectedProduct.id,
                    image_url: selectedProduct.image_url
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to analyze product')
            }

            setProductAnalysis(result.analysis)
            setCurrentStep('scene_ideas')
            generateSceneIdeas(result.analysis)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze product')
            setCurrentStep('error')
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Generate Scene Ideas
    const generateSceneIdeas = async (analysis: string) => {
        setLoading(true)

        try {
            const response = await fetch('/api/generate-scene-ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_analysis: analysis,
                    product_details: selectedProduct,
                    model_details: photoshootType === 'with_model' ? selectedModel : null,
                    photoshoot_type: photoshootType,
                    photoshoot_style: photoshootStyle
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to generate scene ideas')
            }

            setSceneIdeas(result.scene_ideas)
            setCurrentStep('scene_selection')

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate scene ideas')
            setCurrentStep('error')
        } finally {
            setLoading(false)
        }
    }

    // Step 3: User Selects Scene
    const selectScene = (scene: SceneIdea) => {
        setSelectedScene(scene)
        setCurrentStep('final_prompt')
        generateFinalPrompt(scene)
    }

    // Step 4: Generate Final Prompt
    const generateFinalPrompt = async (scene: SceneIdea) => {
        setLoading(true)

        try {
            const response = await fetch('/api/generate-final-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selected_scene: scene,
                    product_details: selectedProduct,
                    model_details: photoshootType === 'with_model' ? selectedModel : null,
                    photoshoot_type: photoshootType,
                    photoshoot_style: photoshootStyle
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to generate final prompt')
            }

            setFinalPrompt(result.final_prompt)
            setCurrentStep('generating')

            // Create photoshoot record and start generation
            createPhotoshootAndGenerate(result)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate final prompt')
            setCurrentStep('error')
        } finally {
            setLoading(false)
        }
    }

    // Step 5: Create Photoshoot and Generate Image
    const createPhotoshootAndGenerate = async (promptData: any) => {
        setLoading(true)

        try {
            // First create the photoshoot
            const photoshootResponse = await fetch('/api/photoshoots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: photoshootName,
                    product_id: selectedProduct?.id,
                    model_id: photoshootType === 'with_model' ? selectedModel?.id : null,
                    type: photoshootType,
                    style: photoshootStyle,
                    scene_details: selectedScene,
                    product_analysis: productAnalysis,
                    final_prompt: promptData.final_prompt
                })
            })

            const photoshootResult = await photoshootResponse.json()

            if (!photoshootResponse.ok) {
                throw new Error(photoshootResult.error || 'Failed to create photoshoot')
            }

            setCurrentPhotoshootId(photoshootResult.photoshoot.id)

            // Then generate the image
            const generateResponse = await fetch('/api/generate-photoshoot-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    photoshoot_id: photoshootResult.photoshoot.id,
                    final_prompt: promptData.final_prompt,
                    reference_images: promptData.reference_images,
                    reference_tags: promptData.reference_tags
                })
            })

            const generateResult = await generateResponse.json()

            if (!generateResponse.ok) {
                throw new Error(generateResult.error || 'Failed to generate image')
            }

            setGeneratedImageUrl(generateResult.generated_image_url)
            setCurrentStep('completed')

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create photoshoot')
            setCurrentStep('error')
        } finally {
            setLoading(false)
        }
    }

    const restartProcess = () => {
        setCurrentStep('setup')
        setProductAnalysis('')
        setSceneIdeas([])
        setSelectedScene(null)
        setFinalPrompt('')
        setGeneratedImageUrl('')
        setCurrentPhotoshootId(null)
        setError('')
    }

    const canProceed = photoshootName && selectedProduct && (photoshootType === 'product_only' || selectedModel)

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Photoshoot</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Use AI to generate professional product photography
                    </p>
                </div>

                {currentStep === 'setup' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Setup Photoshoot</h2>

                        <div className="space-y-6">
                            {/* Photoshoot Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Photoshoot Name
                                </label>
                                <input
                                    type="text"
                                    value={photoshootName}
                                    onChange={(e) => setPhotoshootName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter photoshoot name..."
                                />
                            </div>

                            {/* Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Photoshoot Type
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPhotoshootType('product_only')}
                                        className={`p-4 border-2 rounded-lg text-left transition-colors ${photoshootType === 'product_only'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <h3 className="font-medium text-gray-900 dark:text-white">Product Only</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Focus entirely on the product</p>
                                    </button>
                                    <button
                                        onClick={() => setPhotoshootType('with_model')}
                                        className={`p-4 border-2 rounded-lg text-left transition-colors ${photoshootType === 'with_model'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <h3 className="font-medium text-gray-900 dark:text-white">With Model</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Include a model in the shot</p>
                                    </button>
                                </div>
                            </div>

                            {/* Style Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Style
                                </label>
                                <select
                                    value={photoshootStyle}
                                    onChange={(e) => setPhotoshootStyle(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="professional">Professional</option>
                                    <option value="lifestyle">Lifestyle</option>
                                    <option value="artistic">Artistic</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>

                            {/* Product Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Product
                                </label>
                                {products.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <p>No products found. <a href="/products/new" className="text-blue-600 hover:underline">Create a product first</a>.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {products.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => setSelectedProduct(product)}
                                                className={`p-4 border-2 rounded-lg text-left transition-colors ${selectedProduct?.id === product.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{product.tag}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Model Selection (if with_model) */}
                            {photoshootType === 'with_model' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Model
                                    </label>
                                    {models.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <p>No models found. <a href="/models/new" className="text-blue-600 hover:underline">Create a model first</a>.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {models.map((model) => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => setSelectedModel(model)}
                                                    className={`p-4 border-2 rounded-lg text-left transition-colors ${selectedModel?.id === model.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                        {model.image_url ? (
                                                            <img
                                                                src={model.image_url}
                                                                alt={model.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">{model.name}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{model.tag}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Start Button */}
                            <div className="pt-4">
                                <button
                                    onClick={analyzeProduct}
                                    disabled={!canProceed || loading}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Starting AI Analysis...' : 'Start AI Photoshoot Creation'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 'analyzing' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analyzing Product</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                AI is analyzing your product image to understand its features, style, and photoshoot potential...
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 'scene_ideas' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Generating Scene Ideas</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Creating creative photoshoot scene ideas based on your product analysis...
                            </p>
                            {productAnalysis && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Product Analysis:</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{productAnalysis}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 'scene_selection' && sceneIdeas.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Choose Your Scene</h3>
                        <div className="grid gap-4">
                            {sceneIdeas.map((scene, index) => (
                                <button
                                    key={index}
                                    onClick={() => selectScene(scene)}
                                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{scene.title}</h4>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                            {scene.mood}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <div><strong>Setting:</strong> {scene.setting}</div>
                                        <div><strong>Lighting:</strong> {scene.lighting}</div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{scene.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 'final_prompt' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Generating Final Prompt</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Creating the optimized prompt for Runway ML based on your selected scene...
                            </p>
                            {selectedScene && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Selected Scene: {selectedScene.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedScene.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 'generating' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Generating Image</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Runway ML is generating your photoshoot image. This may take a few minutes...
                            </p>
                            {finalPrompt && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Final Prompt:</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{finalPrompt}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 'completed' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Photoshoot Generated!</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Your AI-generated photoshoot is ready. View the result below.
                            </p>

                            {generatedImageUrl && (
                                <div className="mb-6">
                                    <div className="max-w-md mx-auto border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                        <img
                                            src={generatedImageUrl}
                                            alt="Generated photoshoot"
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 justify-center">
                                <a
                                    href="/photoshoots"
                                    className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    View All Photoshoots
                                </a>
                                <button
                                    onClick={restartProcess}
                                    className="bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                                >
                                    Create Another
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 'error' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-700 p-6">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error</h3>
                            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>

                            <button
                                onClick={restartProcess}
                                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
} 