'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Settings, Save, User, Bell, Shield, Globe, Mail, Database, Key, Eye, EyeOff } from 'lucide-react';
import { withAdmin } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface SettingsData {
  general: {
    site_name: string;
    site_description: string;
    timezone: string;
    currency: string;
    language: string;
    site_logo_url: string;
  };
  notification: {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
    order_notifications: boolean;
    marketing_emails: boolean;
  };
  security: {
    two_factor_auth: boolean;
    session_timeout: number;
    password_expiry: number;
    login_attempts: number;
    account_lockout: number;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    from_email: string;
    from_name: string;
  };
}

function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      site_name: '',
      site_description: '',
      timezone: '',
      currency: '',
      language: '',
      site_logo_url: ''
    },
    notification: {
      email_notifications: false,
      push_notifications: false,
      sms_notifications: false,
      order_notifications: false,
      marketing_emails: false
    },
    security: {
      two_factor_auth: false,
      session_timeout: 30,
      password_expiry: 90,
      login_attempts: 5,
      account_lockout: 15
    },
    email: {
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      from_email: '',
      from_name: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'branding', name: 'Branding', icon: Globe },
    { id: 'notification', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail }
  ];

  // Load settings
  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.settings.getAll();
      if (response.status && response.data) {
        setSettings(prev => ({
          ...prev,
          ...response.data,
          general: {
            ...prev.general,
            ...(response.data.general || {})
          }
        }));
      } else {
        // Fallback to default values if API fails
        console.warn('Failed to load settings from API, using defaults');
        setSettings({
          general: {
            site_name: 'Oriflame Coast Region',
            site_description: 'Premium beauty and wellness products',
            timezone: 'Africa/Nairobi',
            currency: 'KES',
            language: 'en',
            site_logo_url: ''
          },
          notification: {
            email_notifications: true,
            push_notifications: false,
            sms_notifications: false,
            order_notifications: true,
            marketing_emails: false
          },
          security: {
            two_factor_auth: false,
            session_timeout: 30,
            password_expiry: 90,
            login_attempts: 5,
            account_lockout: 15
          },
          email: {
            smtp_host: 'smtp.gmail.com',
            smtp_port: 587,
            smtp_username: '',
            smtp_password: '',
            from_email: 'noreply@oriflame.com',
            from_name: 'Oriflame Coast Region'
          }
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
      // Use default values on error
      setSettings({
        general: {
          site_name: 'Oriflame Coast Region',
          site_description: 'Premium beauty and wellness products',
          timezone: 'Africa/Nairobi',
          currency: 'KES',
          language: 'en',
          site_logo_url: ''
        },
        notification: {
          email_notifications: true,
          push_notifications: false,
          sms_notifications: false,
          order_notifications: true,
          marketing_emails: false
        },
        security: {
          two_factor_auth: false,
          session_timeout: 30,
          password_expiry: 90,
          login_attempts: 5,
          account_lockout: 15
        },
        email: {
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_username: '',
          smtp_password: '',
          from_email: 'noreply@oriflame.com',
          from_name: 'Oriflame Coast Region'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await api.settings.update(settings);
      if (response.status) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to save settings');
      }
      
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Update settings helper
  const updateSettings = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] rounded-xl p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-green-100">Configure your application settings and preferences</p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
            <Settings className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Save className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Settings Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#4CAF50] text-[#4CAF50]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.site_name}
                    onChange={(e) => updateSettings('general', 'site_name', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSettings('general', 'timezone', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  >
                    <option value="Africa/Nairobi">Africa/Nairobi</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.general.site_description}
                    onChange={(e) => updateSettings('general', 'site_description', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => updateSettings('general', 'currency', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  >
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => updateSettings('general', 'language', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Branding Settings */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Branding</h3>
              <p className="text-sm text-gray-500">Upload and manage your site logo.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Logo</label>
                  <div className="flex items-center justify-center border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {settings.general.site_logo_url ? (
                      <Image
                        src={settings.general.site_logo_url}
                        alt="Site Logo"
                        width={160}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-[160px] h-[48px] bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
                        No logo uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">Supported: JPG, PNG, WEBP. Max 5MB.</p>

                  <button
                    onClick={async () => {
                      if (!logoFile) return;
                      try {
                        setUploading(true);
                        setError(null);
                        const res = await api.settings.uploadImage('general.site_logo_url', logoFile);
                        if (res.status && (res as any).data?.url) {
                           const url = (res as any).data.url as string;
                           setSettings(prev => ({
                             ...prev,
                             general: {
                               ...prev.general,
                               site_logo_url: url,
                             }
                           }));
                           setSuccess('Logo uploaded successfully');
                           setTimeout(() => setSuccess(null), 3000);
                           setLogoFile(null);
                         } else {
                           setError((res as any).message || 'Failed to upload logo');
                        }
                      } catch (err: any) {
                        console.error('Logo upload error:', err);
                        setError('Failed to upload logo');
                      } finally {
                        setUploading(false);
                      }
                    }}
                    disabled={uploading || !logoFile}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </button>

                  {settings.general.site_logo_url && (
                    <button
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, site_logo_url: '' }
                      }))}
                      className="mt-3 ml-3 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      Clear Logo (blank state)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notification' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              
              <div className="space-y-4">
                {Object.entries(settings.notification).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {key === 'email_notifications' && 'Receive email notifications for important events'}
                        {key === 'push_notifications' && 'Get push notifications on your device'}
                        {key === 'sms_notifications' && 'Receive SMS notifications for critical updates'}
                        {key === 'order_notifications' && 'Get notified when new orders are placed'}
                        {key === 'marketing_emails' && 'Receive marketing and promotional emails'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSettings('notification', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4CAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.two_factor_auth}
                      onChange={(e) => updateSettings('security', 'two_factor_auth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4CAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.session_timeout}
                      onChange={(e) => updateSettings('security', 'session_timeout', parseInt(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      value={settings.security.password_expiry}
                      onChange={(e) => updateSettings('security', 'password_expiry', parseInt(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.security.login_attempts}
                      onChange={(e) => updateSettings('security', 'login_attempts', parseInt(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Lockout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.account_lockout}
                      onChange={(e) => updateSettings('security', 'account_lockout', parseInt(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={settings.email.smtp_host}
                    onChange={(e) => updateSettings('email', 'smtp_host', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={settings.email.smtp_port}
                    onChange={(e) => updateSettings('email', 'smtp_port', parseInt(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={settings.email.smtp_username}
                    onChange={(e) => updateSettings('email', 'smtp_username', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={settings.email.smtp_password}
                      onChange={(e) => updateSettings('email', 'smtp_password', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={settings.email.from_email}
                    onChange={(e) => updateSettings('email', 'from_email', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={settings.email.from_name}
                    onChange={(e) => updateSettings('email', 'from_name', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4CAF50] to-[#45a049] text-white rounded-lg hover:from-[#45a049] hover:to-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAdmin(AdminSettingsPage, '/login');