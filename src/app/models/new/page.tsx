'use client'

import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function NewModelPage() {
    const router = useRouter()

    return (
        <DashboardLayout
            title="Create New Model"
            breadcrumbs={[
                { name: 'Models', href: '/models' },
                { name: 'Create New' }
            ]}
        >
            <div className="max-w-lg mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Create New Model
                        </h2>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Choose how you want to create your model
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Manual Creation Button */}
                        <button
                            onClick={() => router.push('/models/new/manual')}
                            className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div className="ml-4 text-left">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400">
                                            Manual Creation
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Upload an existing model face image from your device
                                        </p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>

                        {/* AI Generation Button */}
                        <button
                            onClick={() => router.push('/models/new/ai')}
                            className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4 text-left">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400">
                                            AI Generation
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Generate a model face using AI with custom characteristics
                                        </p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
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
                                About Models
                            </h3>
                            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                <p>Models are close-up face images used for AI-powered photography. Each model should show clear facial features and be well-lit for best results.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
} 