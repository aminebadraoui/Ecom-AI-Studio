'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
    children: React.ReactNode
    title?: string
    breadcrumbs?: Array<{ name: string; href?: string }>
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    title,
    breadcrumbs = []
}) => {
    const { user, loading, signOut } = useAuth()
    const router = useRouter()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Handle authentication
    useEffect(() => {
        if (!loading && !user) {
            router.push('/signin')
        }
    }, [user, loading, router])

    // Handle responsive behavior
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 1024 // lg breakpoint
            setIsMobile(mobile)
            if (mobile) {
                setSidebarCollapsed(true)
            }
        }

        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    // Handle sidebar toggle
    const handleSidebarToggle = () => {
        setSidebarCollapsed(!sidebarCollapsed)
    }

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center animate-fade-in">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Loading your workspace...</p>
                </div>
            </div>
        )
    }

    // Redirect if not authenticated
    if (!user) {
        return null
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={isMobile ? true : sidebarCollapsed}
                onToggle={handleSidebarToggle}
                isMobile={isMobile}
            />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
                {/* Top header */}
                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-10">
                    <div className="flex items-center justify-between px-6 py-4">
                        {/* Left side - Mobile menu and Breadcrumbs */}
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                            {/* Mobile menu button */}
                            <button
                                onClick={handleSidebarToggle}
                                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200"
                                aria-label="Toggle sidebar"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Breadcrumbs */}
                            {breadcrumbs.length > 0 && (
                                <nav className="flex items-center space-x-2" aria-label="Breadcrumb">
                                    {breadcrumbs.map((crumb, index) => (
                                        <div key={index} className="flex items-center">
                                            {index > 0 && (
                                                <svg className="w-4 h-4 text-slate-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                            {crumb.href ? (
                                                <a
                                                    href={crumb.href}
                                                    className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors duration-200"
                                                >
                                                    {crumb.name}
                                                </a>
                                            ) : (
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {crumb.name}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </nav>
                            )}
                        </div>

                        {/* Right side - User menu */}
                        <div className="flex items-center space-x-4">
                            {/* Credits indicator */}
                            <div className="hidden sm:flex items-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium border border-emerald-200 dark:border-emerald-800">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                {user.credits} credits
                            </div>

                            {/* User dropdown */}
                            <button
                                onClick={handleSignOut}
                                className="flex items-center space-x-3 text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors duration-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white text-xs font-semibold">
                                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="hidden sm:block font-medium">
                                    {user.full_name || user.email}
                                </span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page title */}
                {title && (
                    <div className="px-6 py-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-balance">
                            {title}
                        </h1>
                    </div>
                )}

                {/* Main content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6 animate-fade-in">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-700/60 px-6 py-4">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <div className="font-medium">
                            © 2024 PhotoStudio AI. All rights reserved.
                        </div>
                        <div className="flex space-x-6">
                            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200">
                                Privacy
                            </a>
                            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200">
                                Terms
                            </a>
                            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200">
                                Support
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default DashboardLayout 