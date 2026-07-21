'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/forms', label: 'Formulaires', icon: FileText },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
]

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user: { email?: string | null }
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-white/10 bg-black p-6 lg:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600/20 p-2 text-blue-400">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-lg font-semibold">Qualiform</p>
              <p className="text-sm text-white/60">IA scoring</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                    active ? 'bg-white/10 text-blue-400' : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-white/10 pt-4">
            <div className="mb-4 rounded-xl bg-white/5 p-3 text-sm text-white/70">
              <p className="font-medium text-white">{user.email ?? 'Utilisateur'}</p>
              <p className="text-xs text-white/50">Compte actif</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-white/75 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur lg:hidden">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-600/20 p-2 text-blue-400">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-semibold">Qualiform</p>
                <p className="text-xs text-white/50">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2"
              aria-label="Ouvrir le menu"
            >
              <Menu size={18} />
            </button>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-black p-6 lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-600/20 p-2 text-blue-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Qualiform</p>
                    <p className="text-sm text-white/60">IA scoring</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2"
                  aria-label="Fermer le menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {links.map((link) => {
                  const Icon = link.icon
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`)

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                        active ? 'bg-white/10 text-blue-400' : 'text-white/75 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="border-t border-white/10 pt-4">
                <div className="mb-4 rounded-xl bg-white/5 p-3 text-sm text-white/70">
                  <p className="font-medium text-white">{user.email ?? 'Utilisateur'}</p>
                  <p className="text-xs text-white/50">Compte actif</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-white/75 transition hover:bg-white/5 hover:text-white"
                >
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
