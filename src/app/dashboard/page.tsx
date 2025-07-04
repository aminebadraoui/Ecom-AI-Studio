'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface DashboardStats {
    products: number
    photoshoots: number
    models: number
}

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState<DashboardStats>({
        products: 0,
        photoshoots: 0,
        models: 0
    })
    const [loading, setLoading] = useState(true)

    // Fetch dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [productsRes, photoshootsRes, modelsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/photoshoots'),
                    fetch('/api/models')
                ])

                const [productsData, photoshootsData, modelsData] = await Promise.all([
                    productsRes.ok ? productsRes.json() : { products: [] },
                    photoshootsRes.ok ? photoshootsRes.json() : { photoshoots: [] },
                    modelsRes.ok ? modelsRes.json() : { models: [] }
                ])

                console.log('Dashboard API responses:', {
                    products: productsData,
                    photoshoots: photoshootsData,
                    models: modelsData
                })

                const newStats = {
                    products: productsData.products?.length || 0,
                    photoshoots: photoshootsData.photoshoots?.length || 0,
                    models: modelsData.models?.length || 0
                }

                console.log('Calculated stats:', newStats)
                setStats(newStats)
            } catch (error) {
                console.error('Error fetching dashboard stats:', error)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchStats()
        }
    }, [user])

    const quickActions = [
        {
            name: 'Create Photoshoot',
            description: 'Generate AI photos with your products',
            href: '/photoshoots/new',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            gradient: 'gradient-primary',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            name: 'Manage Products',
            description: 'Create and organize your products',
            href: '/products',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            gradient: 'gradient-accent',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            iconColor: 'text-purple-600 dark:text-purple-400'
        },
        {
            name: 'Model Faces',
            description: 'Manage your model collection',
            href: '/models',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            gradient: 'bg-gradient-to-r from-emerald-500 to-teal-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconColor: 'text-emerald-600 dark:text-emerald-400'
        },
        {
            name: 'Buy Credits',
            description: 'Purchase additional credits',
            href: '/credits',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            gradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            iconColor: 'text-amber-600 dark:text-amber-400'
        }
    ]

    const getStatsData = () => [
        {
            name: 'Credits Available',
            value: user?.credits || 0,
            change: user?.credits ? 'Ready to use' : 'Purchase credits to get started',
            changeType: (user?.credits || 0) > 0 ? 'positive' : 'neutral',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            )
        },
        {
            name: 'Products',
            value: loading ? '...' : stats.products,
            change: stats.products === 0 ? 'Create your first product' : `${stats.products} product${stats.products !== 1 ? 's' : ''} ready`,
            changeType: stats.products > 0 ? 'positive' : 'neutral',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        },
        {
            name: 'Photoshoots',
            value: loading ? '...' : stats.photoshoots,
            change: stats.photoshoots === 0 ? 'Generate your first photoshoot' : `${stats.photoshoots} photoshoot${stats.photoshoots !== 1 ? 's' : ''} created`,
            changeType: stats.photoshoots > 0 ? 'positive' : 'neutral',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            name: 'Models',
            value: loading ? '...' : stats.models,
            change: stats.models === 0 ? 'Add your first model' : `${stats.models} model${stats.models !== 1 ? 's' : ''} available`,
            changeType: stats.models > 0 ? 'positive' : 'neutral',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ]

    const getNextStepMessage = () => {
        if (stats.products === 0) {
            return "Start by adding your first product to begin creating photoshoots."
        }
        if (stats.models === 0) {
            return "Add a model face to create more realistic photoshoots with people."
        }
        if (stats.photoshoots === 0) {
            return "Create your first AI photoshoot with your products!"
        }
        return "Everything looks great! Keep creating amazing content."
    }

    const getMainActionHref = () => {
        if (stats.products === 0) return '/products/new'
        if (stats.photoshoots === 0) return '/photoshoots/new'
        return '/products'
    }

    const getMainActionText = () => {
        if (stats.products === 0) return 'Add Your First Product'
        if (stats.photoshoots === 0) return 'Create Your First Photoshoot'
        return 'Manage Products'
    }

    return (
        <DashboardLayout
            title="Dashboard"
            breadcrumbs={[
                { name: 'Dashboard' }
            ]}
        >
            {/* Welcome Section */}
            <div className="mb-8">
                <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-white shadow-xl">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 max-w-2xl">
                                <h2 className="text-3xl font-bold mb-3">
                                    Welcome back, {user?.full_name?.split(' ')[0] || 'Creator'}! 👋
                                </h2>
                                <p className="text-blue-100 text-lg mb-2 leading-relaxed">
                                    {getNextStepMessage()}
                                </p>
                                <p className="text-blue-100 mb-6">
                                    You have <span className="font-semibold text-white">{user?.credits || 0} credits</span> ready to use.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={getMainActionHref()}
                                        className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        {getMainActionText()}
                                    </Link>
                                    <Link
                                        href="/photoshoots"
                                        className="inline-flex items-center px-6 py-3 bg-blue-500/20 text-white rounded-xl font-semibold hover:bg-blue-500/30 transition-all duration-200 backdrop-blur-sm border border-white/20"
                                    >
                                        View Photoshoots
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="w-40 h-40 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                                    <svg className="w-20 h-20 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
                        <div className="w-96 h-96 bg-white/5 rounded-full"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
                        <div className="w-64 h-64 bg-white/5 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    Account Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getStatsData().map((stat) => (
                        <div key={stat.name} className="card group hover:shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                        <div className="text-slate-600 dark:text-slate-400">
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-bold ${stat.changeType === 'positive' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                                        {stat.value}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                                        {stat.name}
                                    </p>
                                    <p className={`text-xs ${stat.changeType === 'positive'
                                        ? 'text-emerald-600'
                                        : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                        {stat.change}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action) => (
                        <Link
                            key={action.name}
                            href={action.href}
                            className="group card hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="p-6">
                                <div className={`w-14 h-14 ${action.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                                    <div className={action.iconColor}>
                                        {action.icon}
                                    </div>
                                </div>
                                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                    {action.name}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    {action.description}
                                </p>
                                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                                    Get started
                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Getting Started Section */}
            <div className="card">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        Getting Started
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <div className={`w-8 h-8 ${stats.products > 0 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'} rounded-full flex items-center justify-center text-sm font-semibold`}>
                                {stats.products > 0 ? '✓' : '1'}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-medium mb-1 ${stats.products > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                    Add your first product {stats.products > 0 ? '✓' : ''}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {stats.products > 0 ? `You have ${stats.products} product${stats.products !== 1 ? 's' : ''} ready for photoshoots.` : 'Upload a product image and provide basic details to get started.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className={`w-8 h-8 ${stats.photoshoots > 0 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'} rounded-full flex items-center justify-center text-sm font-semibold`}>
                                {stats.photoshoots > 0 ? '✓' : '2'}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-medium mb-1 ${stats.photoshoots > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                    Create a photoshoot {stats.photoshoots > 0 ? '✓' : ''}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {stats.photoshoots > 0 ? `You've created ${stats.photoshoots} photoshoot${stats.photoshoots !== 1 ? 's' : ''} so far.` : 'Generate AI-powered product photos in various settings and styles.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-semibold">
                                3
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Download and use</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Download your generated images and use them in your marketing materials.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
} 