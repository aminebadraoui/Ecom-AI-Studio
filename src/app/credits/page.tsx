'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function CreditsPage() {
    const { user } = useAuth()

    const pricingPlans = [
        {
            name: 'Starter',
            credits: 10,
            price: 9.99,
            description: 'Perfect for small businesses',
            features: ['10 high-quality edits', 'Standard processing', 'Email support']
        },
        {
            name: 'Professional',
            credits: 50,
            price: 39.99,
            description: 'Great for growing businesses',
            features: ['50 high-quality edits', 'Priority processing', 'Priority support', 'Batch uploads'],
            popular: true
        },
        {
            name: 'Enterprise',
            credits: 200,
            price: 149.99,
            description: 'For large-scale operations',
            features: ['200 high-quality edits', 'Fastest processing', 'Dedicated support', 'Custom integrations']
        }
    ]

    const usageHistory = [
        { date: '2024-01-15', description: 'Product photo enhancement', credits: 3, type: 'used' },
        { date: '2024-01-14', description: 'Background removal batch', credits: 5, type: 'used' },
        { date: '2024-01-10', description: 'Professional plan purchase', credits: 50, type: 'added' },
        { date: '2024-01-08', description: 'Image optimization', credits: 2, type: 'used' }
    ]

    return (
        <DashboardLayout
            title="Credits & Billing"
            breadcrumbs={[
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'Credits' }
            ]}
        >
            {/* Current Balance */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                Current Balance
                            </h2>
                            <p className="text-green-100">
                                You have {user?.credits || 0} credits remaining
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold">
                                {user?.credits || 0}
                            </div>
                            <div className="text-sm text-green-100">
                                credits
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="bg-white bg-opacity-20 rounded-full h-2">
                            <div
                                className="bg-white rounded-full h-2"
                                style={{ width: `${Math.min((user?.credits || 0) / 50 * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-green-100 mt-2">
                            Each photo edit costs 1 credit
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Plans */}
            <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                    Purchase Credits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pricingPlans.map((plan) => (
                        <div key={plan.name} className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-4 py-1 text-xs font-medium rounded-full">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {plan.name}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {plan.description}
                                </p>

                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                        ${plan.price}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                                        for {plan.credits} credits
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    ${(plan.price / plan.credits).toFixed(2)} per credit
                                </div>

                                <button className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}>
                                    Purchase Plan
                                </button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <ul className="space-y-2">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Usage History */}
            <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Usage History
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Recent Transactions
                        </h4>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {usageHistory.map((item, index) => (
                            <div key={index} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {item.description}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(item.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <span className={`text-sm font-medium ${item.type === 'added'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {item.type === 'added' ? '+' : '-'}{item.credits} credits
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Credit Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            How Credits Work
                        </h4>
                        <div className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                            <p>• Each photo enhancement or edit costs 1 credit</p>
                            <p>• Credits never expire once purchased</p>
                            <p>• Unused credits carry over between billing periods</p>
                            <p>• Bulk processing may offer discounted credit rates</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
} 