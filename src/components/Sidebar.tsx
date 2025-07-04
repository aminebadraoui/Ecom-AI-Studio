'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps {
    isCollapsed: boolean
    onToggle: () => void
    isMobile?: boolean
}

interface NavigationItem {
    name: string
    href: string
    icon: React.ReactNode
    badge?: string | number
    description?: string
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, isMobile = false }) => {
    const pathname = usePathname()
    const { user } = useAuth()

    // Navigation sections with organized structure
    const mainNavigation: NavigationItem[] = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4M16 5v4" />
                </svg>
            ),
            description: 'Overview and analytics'
        },
        {
            name: 'Photoshoots',
            href: '/photoshoots',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            description: 'Create and manage photoshoots'
        },
        {
            name: 'Products',
            href: '/products',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            description: 'Manage your product catalog'
        },
        {
            name: 'Models',
            href: '/models',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            description: 'Manage your model faces'
        }
    ]

    const accountNavigation: NavigationItem[] = [
        {
            name: 'Credits',
            href: '/credits',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            badge: user?.credits || 0,
            description: 'Credits and billing'
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            description: 'Account preferences'
        }
    ]

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    const NavLink: React.FC<{ item: NavigationItem }> = ({ item }) => {
        const active = isActive(item.href)

        return (
            <Link
                href={item.href}
                className={`
                    relative group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out
                    ${active
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    }
                    ${isCollapsed ? 'justify-center px-2' : ''}
                `}
                title={isCollapsed ? item.name : undefined}
            >
                {/* Active indicator */}
                {active && (
                    <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
                )}

                <div className={`flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300'}`}>
                    {item.icon}
                </div>

                {!isCollapsed && (
                    <>
                        <span className="ml-3 flex-1 font-medium">{item.name}</span>
                        {item.badge && (
                            <span className={`
                                ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                                ${active
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                }
                            `}>
                                {item.badge}
                            </span>
                        )}
                    </>
                )}
            </Link>
        )
    }

    const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
        if (isCollapsed) return null

        return (
            <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                    {title}
                </h3>
            </div>
        )
    }

    return (
        <>
            {/* Mobile backdrop */}
            {isMobile && !isCollapsed && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity z-20"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={`
                flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-16' : 'w-64'}
                lg:relative lg:translate-x-0
                ${isMobile ? 'fixed inset-y-0 left-0 z-30' : ''}
                ${isMobile && !isCollapsed ? 'translate-x-0' : isMobile ? '-translate-x-full' : ''}
            `}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-700/60 ${isCollapsed ? 'px-2' : ''}`}>
                    {!isCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-lg">PS</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">PhotoStudio</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Photo Editor</p>
                            </div>
                        </div>
                    )}

                    {/* Toggle button */}
                    <button
                        onClick={onToggle}
                        className={`
                            p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 
                            dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 
                            transition-all duration-200
                            ${isCollapsed ? 'mx-auto' : ''}
                        `}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isCollapsed ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                    {/* Main navigation */}
                    <div>
                        <SectionHeader title="Main" />
                        <div className="space-y-1">
                            {mainNavigation.map((item) => (
                                <NavLink key={item.name} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* Account navigation */}
                    <div>
                        <SectionHeader title="Account" />
                        <div className="space-y-1">
                            {accountNavigation.map((item) => (
                                <NavLink key={item.name} item={item} />
                            ))}
                        </div>
                    </div>
                </nav>

                {/* User profile section */}
                {!isCollapsed && user && (
                    <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-semibold">
                                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                    {user.full_name || 'User'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Sidebar 