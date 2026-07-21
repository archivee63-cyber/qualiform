'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Trophy, Clock, Zap, Star } from 'lucide-react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-neutral-950 text-white">
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl' : 'bg-transparent'
      }`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-xl font-bold tracking-tight">Qualiform</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-neutral-400 transition-colors hover:text-white">
              Connexion
            </Link>
            <Link href="/signup" className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-neutral-200">
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="relative flex min-h-screen items-center justify-center px-6 pt-16">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-700/60 bg-neutral-900/80 px-4 py-1.5 backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-neutral-400">IA de recrutement</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
          >
            Trouvez le bon candidat
            <br />
            <span className="text-neutral-500">sans lire 300 CV</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-neutral-400"
          >
            Vos formulaires analysés par IA. Les meilleurs profils remontent automatiquement. Vous ne voyez que l&apos;essentiel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16 flex flex-col justify-center gap-3 sm:flex-row"
          >
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-medium text-black transition-all hover:bg-neutral-200">
              Créer mon formulaire
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#demo" className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-700/60 bg-neutral-900/80 px-8 py-4 text-lg font-medium backdrop-blur transition-all hover:bg-neutral-800">
              Voir la démo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 text-center"
          >
            {[
              { value: '5min', label: 'Pour créer un formulaire' },
              { value: '×10', label: 'Plus rapide que le tri manuel' },
              { value: '85%', label: 'De précision de scoring' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="pointer-events-none absolute left-1/4 top-2/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-1/4 top-1/4 h-[350px] w-[350px] translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />
      </section>

      <section className="px-6 py-40">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <span className="text-sm uppercase tracking-widest text-neutral-500">Le problème</span>
              <h2 className="mb-6 mt-4 text-4xl font-bold leading-tight">
                Vous passez des heures à trier des candidatures
              </h2>
              <p className="text-lg leading-relaxed text-neutral-400">
                Lecture de CV, réponses aux formulaires, comparaison des profils. Un processus long, subjectif, qui vous fait passer à côté de talents.
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-700/60 bg-neutral-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="space-y-4">
                {['300+ CV pour un poste', '4h en moyenne de tri', '60% de bons profils ignorés'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-neutral-400">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-32 grid items-center gap-16 md:grid-cols-2">
            <div className="order-2 rounded-3xl border border-neutral-700/60 bg-neutral-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur md:order-1">
              <div className="space-y-4">
                {[
                  { icon: Zap, text: 'Scoring automatique par IA' },
                  { icon: Trophy, text: 'Top candidats remontés en premier' },
                  { icon: Clock, text: 'Résultats en quelques secondes' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-neutral-300">
                    <item.icon className="h-5 w-5 text-blue-400" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-sm uppercase tracking-widest text-neutral-500">Notre solution</span>
              <h2 className="mb-6 mt-4 text-4xl font-bold leading-tight">
                L&apos;IA lit pour vous. Vous décidez.
              </h2>
              <p className="text-lg leading-relaxed text-neutral-400">
                Définissez vos critères une fois. L&apos;IA analyse chaque réponse, attribue un score objectif, et vous alerte quand un candidat dépasse votre seuil.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="px-6 py-40">
        <div className="mx-auto max-w-5xl">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-4xl font-bold">En trois étapes</h2>
            <p className="text-lg text-neutral-500">Aussi simple que créer un Google Form</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Créez',
                desc: 'Formulaire drag & drop. Champs texte, fichiers, vidéos. Critères de scoring personnalisés.',
                benefit: '5 minutes montre en main'
              },
              {
                step: '2',
                title: 'Partagez',
                desc: 'Un lien à envoyer. Les candidats répondent depuis n’importe quel appareil.',
                benefit: 'Zéro friction candidat'
              },
              {
                step: '3',
                title: 'Recevez',
                desc: 'L’IA score et classe. Vous recevez un email quand un top profil se dégage.',
                benefit: 'Que les meilleurs dans votre inbox'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-neutral-800 to-neutral-900 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative rounded-3xl border border-neutral-700/60 bg-neutral-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur transition-all group-hover:border-neutral-600">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-black">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mb-4 leading-relaxed text-neutral-400">{item.desc}</p>
                  <p className="text-sm font-medium text-blue-400">{item.benefit}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="mb-8 text-2xl font-medium leading-relaxed md:text-3xl">
            “On a réduit notre temps de tri de 4h à 20 minutes. Les scores IA sont étonnamment pertinents. On ne reviendra pas en arrière.”
          </blockquote>
          <div>
            <div className="font-semibold">Marie Lambert</div>
            <div className="text-sm text-neutral-500">DRH, ScaleUp de 150 personnes</div>
          </div>
        </div>
      </section>

      <section className="px-6 py-40">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">Commencez gratuitement</h2>
            <p className="text-lg text-neutral-500">Pas de carte bancaire. Passez en Pro quand vous voulez.</p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-neutral-700/60 bg-neutral-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="mb-2 text-sm text-neutral-500">Gratuit</div>
              <div className="mb-6 text-4xl font-bold">0€</div>
              <ul className="mb-8 space-y-3">
                {['5 formulaires', '50 réponses/mois', '1 modèle IA', 'Export CSV'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-neutral-400">
                    <span className="text-blue-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block rounded-full bg-white py-3 text-center font-medium text-black transition-all hover:bg-neutral-200">
                Démarrer
              </Link>
            </div>

            <div className="relative rounded-3xl bg-white p-8 text-black">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-medium text-white">
                Le plus choisi
              </div>
              <div className="mb-2 text-sm text-neutral-500">Pro</div>
              <div className="mb-6 text-4xl font-bold">19€<span className="text-lg font-normal text-neutral-500">/mois</span></div>
              <ul className="mb-8 space-y-3">
                {['Formulaires illimités', 'Réponses illimitées', 'Tous les modèles IA', 'Notifications email', 'Upload fichiers', 'Support prioritaire'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-neutral-700">
                    <span className="text-blue-600">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block rounded-full bg-blue-600 py-3 text-center font-medium text-white transition-all hover:bg-blue-700">
                Essai gratuit 14 jours
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-40">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-[140px]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            Passez moins de temps à trier.
            <br />
            <span className="text-neutral-500">Plus de temps à recruter.</span>
          </h2>
          <p className="mb-8 text-lg text-neutral-400">
            Créez votre premier formulaire intelligent en 5 minutes.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-medium text-black shadow-[0_0_50px_-5px_rgba(59,130,246,0.5)] transition-all hover:bg-neutral-200 hover:shadow-[0_0_60px_0px_rgba(59,130,246,0.6)]">
            Commencer maintenant
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-neutral-600">Gratuit • Sans engagement • 5 min de setup</p>
        </div>
      </section>

      <footer className="border-t border-neutral-900 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-semibold tracking-tight">Qualiform</span>
          <div className="flex items-center gap-6 text-sm text-neutral-600">
            <span>© 2024</span>
            <a href="#" className="transition-colors hover:text-neutral-400">Confidentialité</a>
            <a href="#" className="transition-colors hover:text-neutral-400">Conditions</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
