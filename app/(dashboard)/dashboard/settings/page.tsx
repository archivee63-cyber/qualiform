'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Key, Bell, User, Save, Check, Eye, EyeOff } from 'lucide-react'

const LLM_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    placeholder: 'sk-...'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    placeholder: 'sk-ant-...'
  },
  {
    id: 'groq',
    name: 'Groq',
    models: ['mixtral-8x7b-32768', 'llama-3-70b-8192', 'gemma2-9b-it'],
    placeholder: 'gsk_...'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    placeholder: 'AIza...'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-coder'],
    placeholder: 'sk-...'
  },
]

export default function SettingsPage() {
  const supabase = createClient()

  const [settings, setSettings] = useState({
    llm_provider: 'openai',
    llm_api_key: '',
    llm_model: 'gpt-4o',
    email_notifications: false,
    scoring_threshold: 70
  })

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    company: ''
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        company: profileData.company || ''
      })
    }

    const { data: settingsData } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsData) {
      setSettings({
        llm_provider: settingsData.llm_provider || 'openai',
        llm_api_key: settingsData.llm_api_key || '',
        llm_model: settingsData.llm_model || 'gpt-4o',
        email_notifications: settingsData.email_notifications || false,
        scoring_threshold: settingsData.scoring_threshold || 70
      })
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Non authentifié')
      setSaving(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        company: profile.company
      })
      .eq('id', user.id)

    if (profileError) {
      setError(profileError.message)
      setSaving(false)
      return
    }

    const { error: settingsError } = await supabase
      .from('admin_settings')
      .upsert({
        user_id: user.id,
        llm_provider: settings.llm_provider,
        llm_api_key: settings.llm_api_key,
        llm_model: settings.llm_model,
        email_notifications: settings.email_notifications,
        scoring_threshold: settings.scoring_threshold
      })

    if (settingsError) {
      setError(settingsError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const currentProvider = LLM_PROVIDERS.find(p => p.id === settings.llm_provider)

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold">Paramètres</h1>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Configuration IA</h2>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Fournisseur LLM</label>
            <select
              value={settings.llm_provider}
              onChange={(e) => {
                const provider = LLM_PROVIDERS.find(p => p.id === e.target.value)
                setSettings({
                  ...settings,
                  llm_provider: e.target.value,
                  llm_model: provider?.models[0] || ''
                })
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none focus:border-blue-500"
            >
              {LLM_PROVIDERS.map(provider => (
                <option key={provider.id} value={provider.id} className="bg-gray-900">
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Modèle</label>
            <select
              value={settings.llm_model}
              onChange={(e) => setSettings({ ...settings, llm_model: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none focus:border-blue-500"
            >
              {currentProvider?.models.map(model => (
                <option key={model} value={model} className="bg-gray-900">
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Clé API</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.llm_api_key}
                onChange={(e) => setSettings({ ...settings, llm_api_key: e.target.value })}
                placeholder={currentProvider?.placeholder || 'Votre clé API'}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 pr-12 font-mono text-sm outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-600">Votre clé est stockée chiffrée dans Supabase</p>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertes email</p>
              <p className="text-sm text-gray-400">
                Recevez un email quand un candidat dépasse le seuil de score
              </p>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                email_notifications: !settings.email_notifications
              })}
              className={`relative h-6 w-12 rounded-full transition-colors ${
                settings.email_notifications ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <motion.div
                animate={{ x: settings.email_notifications ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
              />
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Seuil de score minimum</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.scoring_threshold}
                onChange={(e) => setSettings({
                  ...settings,
                  scoring_threshold: parseInt(e.target.value)
                })}
                className="flex-1 accent-blue-500"
              />
              <span className="w-12 text-right text-2xl font-bold text-blue-400">
                {settings.scoring_threshold}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Vous recevrez un email quand un candidat obtient {settings.scoring_threshold}/100 ou plus
            </p>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Profil</h2>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Nom complet</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none focus:border-blue-500"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Entreprise</label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none focus:border-blue-500"
              placeholder="Votre entreprise (optionnel)"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
            <span className="text-sm text-blue-400">Plan actuel : <strong>Gratuit</strong></span>
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Save className="h-5 w-5" />
              </motion.div>
              Sauvegarde...
            </>
          ) : saved ? (
            <>
              <Check className="h-5 w-5" />
              Paramètres sauvegardés
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Sauvegarder les paramètres
            </>
          )}
        </button>
      </motion.div>
    </div>
  )
}
