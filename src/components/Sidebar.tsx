'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps {
    isCollapsed: boolean
    onToggle: () => void
}

interface NavigationItem {
    name: string
    href: string
    icon: React.ReactNode
    badge?: string | number
    description?: string
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const pathname = usePathname()
    const { user } = useAuth()

    // Navigation sections with organized structure
    const mainNavigation: NavigationItem[] = [
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
          group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
          ${active
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    }
          ${isCollapsed ? 'justify-center px-2' : ''}
        `}
                title={isCollapsed ? item.name : undefined}
            >
                <div className={`flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'}`}>
                    {item.icon}
                </div>

                {!isCollapsed && (
                    <>
                        <span className="ml-3 flex-1">{item.name}</span>
                        {item.badge && (
                            <span className={`
                ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${active
                                    ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }
              `}>
                                {item.badge}
                            </span>
                        )}
                    </>
                )}

                {/* Active indicator */}
                {active && (
                    <div className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-lg" />
                )}
            </Link>
        )
    }

    const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
        if (isCollapsed) return null

        return (
            <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    {title}
                </h3>
            </div>
        )
    }

    return (
        <>
            {/* Mobile backdrop */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden z-20"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-30 flex flex-col bg-white dark:bg-gray-900 shadow-xl transition-all duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isCollapsed
                    ? 'w-16 translate-x-0'
                    : 'w-72 translate-x-0'
                }
        ${!isCollapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'px-2' : ''}`}>
                    {!isCollapsed && (
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">PS</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">PhotoStudio</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">AI Photo Editor</p>
                            </div>
                        </div>
                    )}

                    {/* Toggle button */}
                    <button
                        onClick={onToggle}
                        className={`
              p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 
              dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 
              transition-colors duration-200
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
                <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                    {/* Main Navigation */}
                    <div className="space-y-1">
                        <SectionHeader title="Main" />
                        {mainNavigation.map((item) => (
                            <div key={item.name} className="relative">
                                <NavLink item={item} />
                            </div>
                        ))}
                    </div>

                    {/* Account Navigation */}
                    <div className="space-y-1">
                        <SectionHeader title="Account" />
                        {accountNavigation.map((item) => (
                            <div key={item.name} className="relative">
                                <NavLink item={item} />
                            </div>
                        ))}
                    </div>
                </nav>

                {/* User Profile Section */}
                {user && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {!isCollapsed && (
                                <div className="ml-3 min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {user.full_name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Sidebar 