import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { FileText, MessageSquareText, Sparkles, PlusCircle } from 'lucide-react'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [{ count: formsCount }, { count: responsesCount }] = await Promise.all([
    supabase.from('forms').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('responses').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const { data: forms } = await supabase
    .from('forms')
    .select('id, title, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const qualifiedCount = 0
  const formCount = formsCount ?? 0
  const responseCount = responsesCount ?? 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm text-blue-400">Bienvenue</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Bonjour, {user.email ?? 'utilisateur'}
          </h1>
          <p className="mt-2 text-white/70">{formatDate(new Date())}</p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Nouveau formulaire
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-white/60">Formulaires</p>
            <FileText className="text-blue-400" size={18} />
          </div>
          <p className="text-3xl font-semibold text-white">{formCount}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-white/60">Réponses</p>
            <MessageSquareText className="text-green-400" size={18} />
          </div>
          <p className="text-3xl font-semibold text-white">{responseCount}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-white/60">Candidats qualifiés</p>
            <Sparkles className="text-purple-400" size={18} />
          </div>
          <p className="text-3xl font-semibold text-white">{qualifiedCount}</p>
        </div>
      </div>

      {formCount === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <h2 className="text-2xl font-semibold text-white">Créez votre premier formulaire</h2>
          <p className="mt-2 text-white/70">Lancez votre première expérience de collecte et d’analyse IA.</p>
          <Link
            href="/dashboard/forms/new"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Nouveau formulaire
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Derniers formulaires</h2>
            <Link href="/dashboard/forms" className="text-sm text-blue-400 hover:text-blue-300">
              Voir tout
            </Link>
          </div>

          <div className="space-y-3">
            {forms?.map((form) => (
              <div
                key={form.id}
                className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-white">{form.title}</p>
                  <p className="text-sm text-white/60">
                    {form.status === 'published' ? 'Publié' : 'Brouillon'} •{' '}
                    {new Date(form.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Link
                  href={`/dashboard/forms/${form.id}`}
                  className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
                >
                  Ouvrir
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
