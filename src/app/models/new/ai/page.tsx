'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function AIModelGenerationPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [characteristics, setCharacteristics] = useState({
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

    const handleCharacteristicChange = (key: string, value: string) => {
        setCharacteristics(prev => ({
            ...prev,
            [key]: value
        }))
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
                {/* Coming Soon Notice */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-6">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <div className="ml-4">
                            <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-200">
                                AI Model Generation - Coming Soon
                            </h2>
                            <p className="text-purple-700 dark:text-purple-300">
                                This feature is currently under development and will be available soon.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview of Characteristics Wizard */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-50">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Characteristics Wizard (Preview)
                        </h2>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Define the characteristics for your AI-generated model
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                    1
                                </div>
                                <span className="text-sm font-medium text-purple-600">Basic Info</span>
                            </div>
                            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    2
                                </div>
                                <span className="text-sm font-medium text-gray-500">Physical Features</span>
                            </div>
                            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    3
                                </div>
                                <span className="text-sm font-medium text-gray-500">Generate</span>
                            </div>
                        </div>

                        {/* Form Fields Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Gender
                                </label>
                                <select
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500"
                                >
                                    <option>Select gender...</option>
                                    <option>Female</option>
                                    <option>Male</option>
                                    <option>Non-binary</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Age Range
                                </label>
                                <select
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500"
                                >
                                    <option>Select age range...</option>
                                    <option>18-25</option>
                                    <option>26-35</option>
                                    <option>36-45</option>
                                    <option>46+</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ethnicity
                                </label>
                                <select
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500"
                                >
                                    <option>Select ethnicity...</option>
                                    <option>Caucasian</option>
                                    <option>African American</option>
                                    <option>Asian</option>
                                    <option>Hispanic/Latino</option>
                                    <option>Mixed</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hair Color
                                </label>
                                <select
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500"
                                >
                                    <option>Select hair color...</option>
                                    <option>Blonde</option>
                                    <option>Brown</option>
                                    <option>Black</option>
                                    <option>Red</option>
                                    <option>Gray</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Additional Details
                            </label>
                            <textarea
                                disabled
                                placeholder="Describe any additional characteristics or styling preferences..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => router.push('/models/new')}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                disabled
                                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed"
                            >
                                Generate Model (3 Credits)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex">
                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                What's Coming
                            </h3>
                            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                <p>When available, this feature will use advanced AI (Imagen-4) to generate realistic model faces based on your specified characteristics. Each generation will cost 3 credits.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
} 