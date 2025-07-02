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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    // Redirect if not authenticated
    if (!user) {
        return null
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={isMobile ? true : sidebarCollapsed}
                onToggle={handleSidebarToggle}
            />

            {/* Main content area */}
            <div className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
        ${(isMobile ? true : sidebarCollapsed) ? 'lg:ml-16' : 'lg:ml-72'}
      `}>

                {/* Top header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        {/* Left side - Title and Breadcrumbs */}
                        <div className="flex-1 min-w-0">
                            {/* Mobile menu button */}
                            <button
                                onClick={handleSidebarToggle}
                                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                                aria-label="Open sidebar"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Breadcrumbs */}
                            {breadcrumbs.length > 0 && (
                                <nav className="flex mt-2 sm:mt-0" aria-label="Breadcrumb">
                                    <ol className="flex items-center space-x-2">
                                        {breadcrumbs.map((crumb, index) => (
                                            <li key={index} className="flex items-center">
                                                {index > 0 && (
                                                    <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                )}
                                                {crumb.href ? (
                                                    <a
                                                        href={crumb.href}
                                                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                                                    >
                                                        {crumb.name}
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {crumb.name}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </nav>
                            )}

                            {/* Page title */}
                            {title && (
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                    {title}
                                </h1>
                            )}
                        </div>

                        {/* Right side - User menu */}
                        <div className="flex items-center space-x-4">
                            {/* Credits indicator */}
                            <div className="hidden sm:flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                {user.credits} credits
                            </div>

                            {/* User dropdown */}
                            <div className="relative">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                                        <span className="text-white text-xs font-medium">
                                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden sm:block">
                                        {user.full_name || user.email}
                                    </span>
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div>
                            © 2024 PhotoStudio. All rights reserved.
                        </div>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                                Privacy
                            </a>
                            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                                Terms
                            </a>
                            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
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