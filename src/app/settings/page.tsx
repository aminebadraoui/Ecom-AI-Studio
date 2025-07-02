'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
    const { user, signOut } = useAuth()
    const [activeTab, setActiveTab] = useState('profile')

    const tabs = [
        { id: 'profile', name: 'Profile', icon: '👤' },
        { id: 'account', name: 'Account', icon: '⚙️' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'security', name: 'Security', icon: '🔒' }
    ]

    const handleSaveProfile = () => {
        // TODO: Implement profile update
        alert('Profile settings saved! (Not implemented yet)')
    }

    const handleDeleteAccount = () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // TODO: Implement account deletion
            alert('Account deletion requested! (Not implemented yet)')
        }
    }

    return (
        <DashboardLayout
            title="Account Settings"
            breadcrumbs={[
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'Settings' }
            ]}
        >
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Navigation */}
                <div className="lg:w-64">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className="mr-3 text-lg">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                Profile Information
                            </h3>

                            <div className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex items-center space-x-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-2xl font-medium">
                                            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                                            Change Avatar
                                        </button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            JPG, GIF or PNG. Max size of 2MB.
                                        </p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={user?.full_name || ''}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email || ''}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Company (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Your company name"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Time Zone
                                        </label>
                                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                                            <option>UTC-08:00 (Pacific Time)</option>
                                            <option>UTC-05:00 (Eastern Time)</option>
                                            <option>UTC+00:00 (GMT)</option>
                                            <option>UTC+01:00 (Central European Time)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            {/* Account Details */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Account Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Account Type</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Free Plan</p>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
                                            Upgrade
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Member Since</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Credits Balance</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.credits || 0} credits</p>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
                                            Purchase More
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-4">
                                    Danger Zone
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                                Delete Account
                                            </p>
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                Permanently delete your account and all associated data
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                Notification Preferences
                            </h3>

                            <div className="space-y-6">
                                {[
                                    { name: 'Email Notifications', description: 'Receive updates about your projects via email' },
                                    { name: 'Processing Complete', description: 'Get notified when image processing is finished' },
                                    { name: 'Credit Alerts', description: 'Alert when credits are running low' },
                                    { name: 'Marketing Updates', description: 'Receive news about new features and promotions' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {item.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.description}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={index < 2} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {/* Password Change */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                    Change Password
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            {/* Sign Out All Devices */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Security Actions
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Sign out all devices
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                This will sign you out of all devices except this one
                                            </p>
                                        </div>
                                        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors duration-200">
                                            Sign Out All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
} 