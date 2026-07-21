'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, Loader2, Eye, Users } from 'lucide-react'
import { EvaluationDetail } from '@/components/evaluations/evaluation-detail'

interface Response {
  id: string
  candidate_name: string
  candidate_email: string
  submitted_at: string
  evaluations: Evaluation[] | null
}

interface Evaluation {
  id: string
  total_score: number
  max_score: number
  strengths: string[]
  weaknesses: string[]
  justification: string
  scores_by_criteria: any[]
  llm_used: string
}

interface Form {
  id: string
  title: string
  status: string
}

interface Question {
  id: string
  question_text: string
}

export function FormResponses({
  form,
  responses,
  questions,
}: {
  form: Form
  responses: Response[]
  questions: Question[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [evaluating, setEvaluating] = useState<string | null>(null)
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)
  const [filter, setFilter] = useState<'all' | 'evaluated' | 'unevaluated' | 'qualified'>('all')
  const [error, setError] = useState('')

  const handleEvaluate = async (responseId: string) => {
    setEvaluating(responseId)
    setError('')

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setEvaluating(null)
    }
  }

  const filteredResponses = responses.filter((r) => {
    const evaluations = Array.isArray(r.evaluations) ? r.evaluations : []
    const hasEval = evaluations.length > 0
    const score = hasEval ? evaluations[0].total_score : 0

    switch (filter) {
      case 'evaluated':
        return hasEval
      case 'unevaluated':
        return !hasEval
      case 'qualified':
        return hasEval && score >= 70
      default:
        return true
    }
  })

  const getScoreBadge = (response: Response) => {
    if (!response.evaluations || response.evaluations.length === 0) {
      return <span className="rounded-lg bg-gray-800 px-2 py-1 text-xs text-gray-400">En attente</span>
    }

    const score = response.evaluations[0].total_score

    if (score >= 70) {
      return <span className="rounded-lg bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">{score}/100</span>
    }
    if (score >= 40) {
      return <span className="rounded-lg bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-400">{score}/100</span>
    }
    return <span className="rounded-lg bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">{score}/100</span>
  }

  const copyFormLink = () => {
    const link = `${window.location.origin}/form/${form.id}`
    navigator.clipboard.writeText(link)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="rounded-xl p-2 transition-colors hover:bg-white/5">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{form.title}</h1>
            <p className="text-sm text-gray-400">
              {form.status === 'published' ? '🟢 Publié' : '📝 Brouillon'} · {responses.length} réponse{responses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={copyFormLink}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10"
        >
          📋 Copier le lien
        </button>
      </div>

      {error ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </motion.div>
      ) : null}

      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'evaluated', label: 'Évalués' },
          { key: 'unevaluated', label: 'Non évalués' },
          { key: 'qualified', label: 'Qualifiés (≥70)' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`rounded-xl px-4 py-2 text-sm transition-colors ${
              filter === f.key ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredResponses.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 py-20 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-700" />
          <p className="text-lg text-gray-500">Aucune réponse pour le moment</p>
          <p className="text-sm text-gray-600">Partagez le lien du formulaire pour recevoir des candidatures</p>
        </motion.div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Candidat</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Email</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Date</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Score</th>
                  <th className="p-4 text-right text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((response) => (
                  <motion.tr key={response.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/5 transition-colors hover:bg-white/5">
                    <td className="p-4 font-medium">{response.candidate_name}</td>
                    <td className="p-4 text-sm text-gray-400">{response.candidate_email}</td>
                    <td className="p-4 text-sm text-gray-400">{new Date(response.submitted_at).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4">{getScoreBadge(response)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {!response.evaluations || response.evaluations.length === 0 ? (
                          <button
                            onClick={() => handleEvaluate(response.id)}
                            disabled={evaluating === response.id}
                            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs transition-colors hover:bg-blue-700 disabled:opacity-50"
                          >
                            {evaluating === response.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            Évaluer
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedResponse(response)}
                            className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs transition-colors hover:bg-white/10"
                          >
                            <Eye className="h-3 w-3" />
                            Voir
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedResponse?.evaluations?.[0] ? (
          <EvaluationDetail
            response={selectedResponse}
            evaluation={selectedResponse.evaluations[0]}
            questions={questions}
            onClose={() => setSelectedResponse(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
