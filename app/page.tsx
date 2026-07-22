'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  Star,
  FileText,
  Cpu,
  ShieldCheck,
  Share2,
  Trophy,
  Check,
} from 'lucide-react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
  }

  return (
    <div className="bg-neutral-950 text-white">
      {/* NAV */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-xl font-bold tracking-tight">Qualiform</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-neutral-200"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center px-6 pt-16"
      >
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-700/60 bg-neutral-900/80 px-4 py-1.5 backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-neutral-400">IA de recrutement</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-balance text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
          >
            Trouvez le bon candidat
            <br />
            <span className="text-neutral-500">sans lire 300 CV.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mb-10 max-w-xl text-pretty text-lg leading-relaxed text-neutral-400"
          >
            Vos formulaires sont analysés par IA. Les meilleurs profils remontent
            automatiquement. Vous ne voyez que l&apos;essentiel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-medium text-black shadow-[0_0_50px_-5px_rgba(59,130,246,0.5)] transition-all hover:bg-neutral-200 hover:shadow-[0_0_60px_0px_rgba(59,130,246,0.6)]"
            >
              Créer mon formulaire gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-700/60 bg-neutral-900/80 px-8 py-4 text-lg font-medium backdrop-blur transition-all hover:bg-neutral-800"
            >
              Voir comment ça marche
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-center"
          >
            {[
              { value: '85%', label: 'précision' },
              { value: '10x', label: 'plus rapide' },
              { value: '5 min', label: 'de setup' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero glows */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="pointer-events-none absolute left-1/4 top-2/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-1/4 top-1/4 h-[350px] w-[350px] translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />
      </section>

      {/* TRUST */}
      <section className="px-6 py-40">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            {...fadeUp}
            className="mx-auto mb-16 max-w-2xl text-balance text-center text-3xl font-bold leading-tight md:text-4xl"
          >
            La précision de l&apos;IA, la simplicité d&apos;un formulaire.
          </motion.h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: FileText,
                title: '500+ formulaires créés',
                desc: 'Des équipes RH et startups font déjà confiance à Qualiform.',
              },
              {
                icon: Cpu,
                title: 'Modèles IA avancés',
                desc: 'Analyse sémantique des réponses, pas de simple mots-clés.',
              },
              {
                icon: ShieldCheck,
                title: 'Données sécurisées',
                desc: 'Vos candidatures sont chiffrées et jamais revendues.',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl border border-neutral-700/60 bg-neutral-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
                  <card.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{card.title}</h3>
                <p className="leading-relaxed text-neutral-400">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <motion.div
            {...fadeUp}
            className="mx-auto mt-12 max-w-3xl rounded-3xl border border-neutral-700/60 bg-neutral-900/80 p-10 text-center shadow-2xl shadow-black/40 backdrop-blur"
          >
            <div className="mb-6 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="mb-6 text-balance text-xl font-medium leading-relaxed md:text-2xl">
              “Avant Qualiform, je passais 4h par semaine à trier des
              candidatures. Aujourd&apos;hui, je consulte directement les
              meilleurs profils. Un vrai changement.”
            </blockquote>
            <div className="text-sm text-neutral-500">Marie L., DRH</div>
          </motion.div>

          <motion.p
            {...fadeUp}
            className="mt-8 text-center text-sm text-neutral-500"
          >
            L&apos;IA applique vos critères, sans biais.
          </motion.p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 py-40">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="mb-20 text-center">
            <h2 className="mb-4 text-4xl font-bold">Comment ça marche</h2>
            <p className="text-lg text-neutral-500">
              Aussi simple que créer un Google Form
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                icon: FileText,
                title: 'Créez votre formulaire',
                desc: 'Un builder drag & drop pour composer vos questions et définir vos critères de scoring.',
                benefit: '5 minutes montre en main',
              },
              {
                step: '2',
                icon: Share2,
                title: 'Partagez le lien',
                desc: 'Un lien unique à envoyer. Les candidats répondent depuis n’importe quel appareil.',
                benefit: 'Un lien, zéro friction',
              },
              {
                step: '3',
                icon: Trophy,
                title: 'Recevez les meilleurs',
                desc: 'L’IA score et classe chaque réponse. Vous êtes notifié dès qu’un top profil se dégage.',
                benefit: 'Scoring automatique + notification email',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.15 }}
                className="group relative"
              >
                <div className="relative h-full rounded-3xl border border-neutral-700/60 bg-neutral-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur transition-all group-hover:border-neutral-600">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-5xl font-bold text-neutral-800">
                      {item.step}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10">
                      <item.icon className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mb-4 leading-relaxed text-neutral-400">
                    {item.desc}
                  </p>
                  <p className="text-sm font-medium text-blue-400">
                    {item.benefit}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OBJECTIONS / FAQ */}
      <section className="px-6 py-40">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">Vos questions, nos réponses</h2>
            <p className="text-lg text-neutral-500">
              Tout ce que vous devez savoir avant de commencer
            </p>
          </motion.div>

          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
            {[
              {
                q: 'L’IA peut-elle vraiment juger un candidat ?',
                a: 'L’IA n’élimine personne. Elle applique les critères que vous définissez et attribue un score objectif pour vous aider à prioriser.',
              },
              {
                q: 'Est-ce que mes données sont en sécurité ?',
                a: 'Toutes les candidatures sont chiffrées, hébergées en Europe, et ne sont jamais utilisées pour entraîner des modèles tiers.',
              },
              {
                q: 'Faut-il des compétences techniques ?',
                a: 'Aucune. Si vous savez utiliser un formulaire en ligne, vous savez utiliser Qualiform. Le setup prend 5 minutes.',
              },
              {
                q: 'Et si je veux garder le contrôle ?',
                a: 'Vous gardez toujours la main : les scores sont une aide à la décision, vous consultez chaque réponse quand vous le souhaitez.',
              },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}>
                <h3 className="mb-3 text-lg font-semibold">{item.q}</h3>
                <p className="leading-relaxed text-neutral-400">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-40">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">Un prix simple</h2>
            <p className="text-lg text-neutral-500">
              Commencez gratuitement, passez en Pro quand vous voulez.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            {/* Free */}
            <motion.div
              {...fadeUp}
              className="rounded-3xl border border-neutral-700/60 bg-neutral-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur"
            >
              <div className="mb-2 text-sm text-neutral-500">Gratuit</div>
              <div className="mb-6 text-4xl font-bold">0€</div>
              <ul className="mb-8 space-y-3">
                {['5 formulaires', '50 réponses/mois', '1 modèle IA', 'Export CSV'].map(
                  (f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-neutral-400"
                    >
                      <Check className="h-4 w-4 text-blue-400" />
                      {f}
                    </li>
                  ),
                )}
              </ul>
              <Link
                href="/signup"
                className="block rounded-full bg-white py-3 text-center font-medium text-black transition-all hover:bg-neutral-200"
              >
                Démarrer
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1 }}
              className="relative rounded-3xl bg-white p-8 text-black shadow-[0_0_60px_-10px_rgba(59,130,246,0.5)]"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-medium text-white">
                Le plus choisi
              </div>
              <div className="mb-2 text-sm text-neutral-500">Pro</div>
              <div className="mb-6 text-4xl font-bold">
                19€
                <span className="text-lg font-normal text-neutral-500">/mois</span>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  'Formulaires illimités',
                  'Réponses illimitées',
                  'Tous les modèles IA',
                  'Notifications email',
                  'Export CSV',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-neutral-700">
                    <Check className="h-4 w-4 text-blue-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block rounded-full bg-blue-600 py-3 text-center font-medium text-white transition-all hover:bg-blue-700"
              >
                Essai gratuit 14 jours
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-6 py-40">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-[140px]" />
        <motion.div {...fadeUp} className="relative mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-balance text-4xl font-bold leading-tight md:text-5xl">
            Passez moins de temps à trier.
            <br />
            <span className="text-neutral-500">Plus de temps à recruter.</span>
          </h2>
          <Link
            href="/signup"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-medium text-black shadow-[0_0_50px_-5px_rgba(59,130,246,0.5)] transition-all hover:bg-neutral-200 hover:shadow-[0_0_60px_0px_rgba(59,130,246,0.6)]"
          >
            Commencer maintenant
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-6 text-sm text-neutral-600">
            Gratuit • Sans carte bancaire • 5 min de setup
          </p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-semibold tracking-tight">Qualiform</span>
          <div className="flex items-center gap-6 text-sm text-neutral-600">
            <span>© 2024 Qualiform</span>
            <a href="#" className="transition-colors hover:text-neutral-400">
              Confidentialité
            </a>
            <a href="#" className="transition-colors hover:text-neutral-400">
              Conditions
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
