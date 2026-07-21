import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'

export default async function FormsPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: forms } = await supabase
    .from('forms')
    .select('id, title, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Formulaires</h1>
          <p className="text-sm text-white/70">Gérez vos formulaires et vos réponses depuis ici.</p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Nouveau formulaire
        </Link>
      </div>

      {forms && forms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {forms.map((form) => (
            <div
              key={form.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{form.title}</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Créé le {new Date(form.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    form.status === 'published'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-orange-500/15 text-orange-400'
                  }`}
                >
                  {form.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
              </div>

              <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                <span>Réponses</span>
                <span className="font-semibold text-white">0</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/forms/${form.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
                >
                  <Eye size={16} />
                  Voir
                </Link>
                <Link
                  href={`/dashboard/forms/${form.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
                >
                  <Pencil size={16} />
                  Modifier
                </Link>
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5">
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <h2 className="text-2xl font-semibold text-white">Aucun formulaire</h2>
          <p className="mt-2 text-white/70">Commencez par créer votre premier formulaire.</p>
          <Link
            href="/dashboard/forms/new"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Créer un formulaire
          </Link>
        </div>
      )}
    </div>
  )
}
