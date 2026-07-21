'use client'

import { motion } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, Brain } from 'lucide-react'

interface Evaluation {
  id: string
  total_score: number
  max_score: number
  strengths: string[]
  weaknesses: string[]
  justification: string
  scores_by_criteria: Array<{ name: string; score: number; maxScore: number }>
  llm_used: string
}

interface Response {
  candidate_name: string
  candidate_email: string
}

interface Question {
  id: string
  question_text: string
}

export function EvaluationDetail({
  response,
  evaluation,
  questions,
  onClose,
}: {
  response: Response
  evaluation: Evaluation
  questions: Question[]
  onClose: () => void
}) {
  const percentage = Math.round((evaluation.total_score / evaluation.max_score) * 100)
  const color = percentage >= 70 ? 'text-green-500' : percentage >= 40 ? 'text-orange-500' : 'text-red-500'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-gray-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between rounded-t-3xl border-b border-white/10 bg-gray-950 p-6">
          <div>
            <h2 className="text-xl font-bold">{response.candidate_name}</h2>
            <p className="text-sm text-gray-400">{response.candidate_email}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-col items-center py-6">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90 transform">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/10" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={color}
                  strokeDasharray={`${percentage * 3.52} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${color}`}>{evaluation.total_score}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">sur {evaluation.max_score}</p>
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <Brain className="h-4 w-4 text-blue-400" />
              Scores par critère
            </h3>
            {evaluation.scores_by_criteria.map((criterion, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{criterion.name}</span>
                  <span className="text-gray-400">{criterion.score}/{criterion.maxScore}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(criterion.score / criterion.maxScore) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${criterion.score / criterion.maxScore >= 0.7 ? 'bg-green-500' : criterion.score / criterion.maxScore >= 0.4 ? 'bg-orange-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-green-400">
              <CheckCircle className="h-4 w-4" />
              Points forts
            </h3>
            <ul className="space-y-2">
              {evaluation.strengths.map((strength, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="mt-1 text-green-400">•</span>
                  {strength}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              Axes d&apos;amélioration
            </h3>
            <ul className="space-y-2">
              {evaluation.weaknesses.map((weakness, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="mt-1 text-orange-400">•</span>
                  {weakness}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 rounded-xl bg-white/5 p-4">
            <h3 className="font-semibold">Analyse détaillée</h3>
            <p className="text-sm leading-relaxed text-gray-400">{evaluation.justification}</p>
          </div>

          <p className="text-center text-xs text-gray-600">Évalué par {evaluation.llm_used}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
