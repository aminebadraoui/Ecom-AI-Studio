'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

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

export default function AIModelGenerationPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [characteristics, setCharacteristics] = useState<Characteristics>({
        modelName: '',
        gender: '',
        age: '',
        ethnicity: '',
        hairColor: '',
        hairStyle: '',
        eyeColor: '',
        skinTone: '',
        expression: '',
        additional: ''
    })

    const handleCharacteristicChange = (key: keyof Characteristics, value: string) => {
        setCharacteristics(prev => ({
            ...prev,
            [key]: value
        }))
        setError(null)
    }

    const handleNext = () => {
        if (step === 1) {
            // Validate basic info
            if (!characteristics.modelName.trim()) {
                setError('Please enter a model name')
                return
            }
            if (!characteristics.gender || !characteristics.age || !characteristics.ethnicity) {
                setError('Please fill in all basic information fields')
                return
            }
        }

        if (step === 2) {
            // Validate physical features
            if (!characteristics.hairColor || !characteristics.eyeColor || !characteristics.skinTone) {
                setError('Please fill in all physical feature fields')
                return
            }
        }

        setError(null)
        setStep(step + 1)
    }

    const handleBack = () => {
        setError(null)
        setStep(step - 1)
    }

    const handleGenerate = async () => {
        setIsGenerating(true)
        setError(null)

        try {
            // Step 1: Generate prompt with OpenAI
            const promptResponse = await fetch('/api/generate-model-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ characteristics }),
            })

            if (!promptResponse.ok) {
                const errorData = await promptResponse.json()
                throw new Error(errorData.error || 'Failed to generate prompt')
            }

            const { prompt } = await promptResponse.json()

            // Step 2: Generate image with Imagen-4 via Replicate
            const imageResponse = await fetch('/api/generate-model-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    modelName: characteristics.modelName
                }),
            })

            if (!imageResponse.ok) {
                const errorData = await imageResponse.json()
                throw new Error(errorData.error || 'Failed to generate image')
            }

            const result = await imageResponse.json()
            router.push(`/models/${result.modelId}`)

        } catch (error) {
            console.error('Error generating model:', error)
            setError(error instanceof Error ? error.message : 'Failed to generate model')
        } finally {
            setIsGenerating(false)
        }
    }

    const isStepComplete = (stepNumber: number) => {
        switch (stepNumber) {
            case 1:
                return characteristics.modelName.trim() &&
                    characteristics.gender &&
                    characteristics.age &&
                    characteristics.ethnicity
            case 2:
                return characteristics.hairColor &&
                    characteristics.eyeColor &&
                    characteristics.skinTone
            default:
                return true
        }
    }

    return (
        <DashboardLayout
            title="AI Model Generation"
            breadcrumbs={[
                { name: 'Models', href: '/models' },
                { name: 'Create New', href: '/models/new' },
                { name: 'AI Generation' }
            ]}
        >
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            AI Model Generation
                        </h2>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Define characteristics to generate a realistic model face
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800 dark:text-red-200">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Progress Steps */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
                                    }`}>
                                    {isStepComplete(1) && step > 1 ? '✓' : '1'}
                                </div>
                                <span className={`text-sm font-medium ${step >= 1 ? 'text-purple-600' : 'text-gray-500'
                                    }`}>Basic Info</span>
                            </div>
                            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
                                    }`}>
                                    {isStepComplete(2) && step > 2 ? '✓' : '2'}
                                </div>
                                <span className={`text-sm font-medium ${step >= 2 ? 'text-purple-600' : 'text-gray-500'
                                    }`}>Physical Features</span>
                            </div>
                            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
                                    }`}>
                                    3
                                </div>
                                <span className={`text-sm font-medium ${step >= 3 ? 'text-purple-600' : 'text-gray-500'
                                    }`}>Generate</span>
                            </div>
                        </div>

                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Basic Information
                                </h3>

                                {/* Model Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Model Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={characteristics.modelName}
                                        onChange={(e) => handleCharacteristicChange('modelName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter model name"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Gender *
                                        </label>
                                        <select
                                            value={characteristics.gender}
                                            onChange={(e) => handleCharacteristicChange('gender', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select gender...</option>
                                            <option value="female">Female</option>
                                            <option value="male">Male</option>
                                            <option value="non-binary">Non-binary</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Age Range *
                                        </label>
                                        <select
                                            value={characteristics.age}
                                            onChange={(e) => handleCharacteristicChange('age', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select age range...</option>
                                            <option value="18-25">18-25 years</option>
                                            <option value="26-35">26-35 years</option>
                                            <option value="36-45">36-45 years</option>
                                            <option value="46-55">46-55 years</option>
                                            <option value="56+">56+ years</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Ethnicity *
                                        </label>
                                        <select
                                            value={characteristics.ethnicity}
                                            onChange={(e) => handleCharacteristicChange('ethnicity', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select ethnicity...</option>
                                            <option value="caucasian">Caucasian</option>
                                            <option value="african-american">African American</option>
                                            <option value="asian">Asian</option>
                                            <option value="hispanic-latino">Hispanic/Latino</option>
                                            <option value="middle-eastern">Middle Eastern</option>
                                            <option value="native-american">Native American</option>
                                            <option value="mixed">Mixed Heritage</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Physical Features */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Physical Features
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Hair Color *
                                        </label>
                                        <select
                                            value={characteristics.hairColor}
                                            onChange={(e) => handleCharacteristicChange('hairColor', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select hair color...</option>
                                            <option value="blonde">Blonde</option>
                                            <option value="light-brown">Light Brown</option>
                                            <option value="dark-brown">Dark Brown</option>
                                            <option value="black">Black</option>
                                            <option value="red">Red</option>
                                            <option value="auburn">Auburn</option>
                                            <option value="gray">Gray</option>
                                            <option value="silver">Silver</option>
                                            <option value="white">White</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Hair Style
                                        </label>
                                        <select
                                            value={characteristics.hairStyle}
                                            onChange={(e) => handleCharacteristicChange('hairStyle', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select hair style...</option>
                                            <option value="straight">Straight</option>
                                            <option value="wavy">Wavy</option>
                                            <option value="curly">Curly</option>
                                            <option value="coily">Coily</option>
                                            <option value="short">Short</option>
                                            <option value="medium">Medium Length</option>
                                            <option value="long">Long</option>
                                            <option value="updo">Updo</option>
                                            <option value="bob">Bob</option>
                                            <option value="pixie">Pixie Cut</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Eye Color *
                                        </label>
                                        <select
                                            value={characteristics.eyeColor}
                                            onChange={(e) => handleCharacteristicChange('eyeColor', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select eye color...</option>
                                            <option value="brown">Brown</option>
                                            <option value="dark-brown">Dark Brown</option>
                                            <option value="hazel">Hazel</option>
                                            <option value="green">Green</option>
                                            <option value="blue">Blue</option>
                                            <option value="light-blue">Light Blue</option>
                                            <option value="gray">Gray</option>
                                            <option value="amber">Amber</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Skin Tone *
                                        </label>
                                        <select
                                            value={characteristics.skinTone}
                                            onChange={(e) => handleCharacteristicChange('skinTone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select skin tone...</option>
                                            <option value="very-fair">Very Fair</option>
                                            <option value="fair">Fair</option>
                                            <option value="light">Light</option>
                                            <option value="medium">Medium</option>
                                            <option value="olive">Olive</option>
                                            <option value="tan">Tan</option>
                                            <option value="brown">Brown</option>
                                            <option value="dark-brown">Dark Brown</option>
                                            <option value="deep">Deep</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Expression
                                        </label>
                                        <select
                                            value={characteristics.expression}
                                            onChange={(e) => handleCharacteristicChange('expression', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select expression...</option>
                                            <option value="neutral">Neutral</option>
                                            <option value="slight-smile">Slight Smile</option>
                                            <option value="smile">Smile</option>
                                            <option value="serious">Serious</option>
                                            <option value="confident">Confident</option>
                                            <option value="friendly">Friendly</option>
                                            <option value="professional">Professional</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Additional Details
                                    </label>
                                    <textarea
                                        value={characteristics.additional}
                                        onChange={(e) => handleCharacteristicChange('additional', e.target.value)}
                                        placeholder="Describe any additional characteristics, makeup style, or specific features..."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review and Generate */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Review & Generate
                                </h3>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                                    <div><strong>Model Name:</strong> {characteristics.modelName}</div>
                                    <div><strong>Gender:</strong> {characteristics.gender}</div>
                                    <div><strong>Age:</strong> {characteristics.age}</div>
                                    <div><strong>Ethnicity:</strong> {characteristics.ethnicity}</div>
                                    <div><strong>Hair:</strong> {characteristics.hairColor} {characteristics.hairStyle && `(${characteristics.hairStyle})`}</div>
                                    <div><strong>Eyes:</strong> {characteristics.eyeColor}</div>
                                    <div><strong>Skin Tone:</strong> {characteristics.skinTone}</div>
                                    {characteristics.expression && <div><strong>Expression:</strong> {characteristics.expression}</div>}
                                    {characteristics.additional && <div><strong>Additional:</strong> {characteristics.additional}</div>}
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-purple-800 dark:text-purple-200">
                                                <strong>Cost:</strong> 3 credits will be deducted from your account to generate this model using AI.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={step === 1 ? () => router.push('/models/new') : handleBack}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                {step === 1 ? 'Cancel' : 'Back'}
                            </button>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Generating Model...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            Generate Model (3 Credits)
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex">
                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                AI Generation Tips
                            </h3>
                            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Be specific with characteristics for better results</li>
                                    <li>Generated models work best with natural expressions</li>
                                    <li>The AI will create a close-up portrait suitable for product photography</li>
                                    <li>Each generation is unique - you may need multiple attempts</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
} 