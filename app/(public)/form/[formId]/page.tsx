'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Video, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { notFound } from 'next/navigation'

interface Form {
  id: string
  title: string
  description: string
  status: string
  user_id: string
}

interface Question {
  id: string
  question_text: string
  type: 'text' | 'textarea' | 'select' | 'file' | 'video_link' | 'scale'
  required: boolean
  options?: string[]
  scale_max?: number
  order_index: number
}

interface Answer {
  [questionId: string]: string | number | File | null
}

export default function FormPage({ params }: { params: { formId: string } }) {
  const supabase = createClient()
  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundError, setNotFoundError] = useState(false)

  useEffect(() => {
    const loadForm = async () => {
      try {
        const { data: formData, error: formError } = await supabase
          .from('forms')
          .select('*')
          .eq('id', params.formId)
          .single()

        if (formError || !formData || formData.status !== 'published') {
          setNotFoundError(true)
          return
        }

        setForm(formData)

        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('form_id', params.formId)
          .order('order_index')

        setQuestions(questionsData || [])
      } catch (err) {
        setNotFoundError(true)
      } finally {
        setLoading(false)
      }
    }

    loadForm()
  }, [params.formId, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-blue-400"
        >
          <Loader2 className="h-8 w-8" />
        </motion.div>
      </div>
    )
  }

  if (notFoundError || !form) {
    notFound()
  }

  return <PublicFormContent form={form} questions={questions} />
}

function PublicFormContent({ form, questions }: { form: Form; questions: Question[] }) {
  const supabase = createClient()
  const [answers, setAnswers] = useState<Answer>({})
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [fileUploading, setFileUploading] = useState<{ [key: string]: boolean }>({})
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!candidateName.trim()) {
      errors.name = 'Le nom est obligatoire'
    }
    if (!candidateEmail.trim()) {
      errors.email = 'L\'email est obligatoire'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)) {
      errors.email = 'Email invalide'
    }

    questions.forEach((q) => {
      if (q.required && !answers[q.id]) {
        errors[q.id] = 'Ce champ est obligatoire'
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFileUpload = async (questionId: string, file: File) => {
    setFileUploading((prev) => ({ ...prev, [questionId]: true }))
    setError('')

    try {
      const fileName = `${form.id}/${questionId}/${Date.now()}-${file.name}`
      const { data, error: uploadError } = await supabase.storage
        .from('candidate-files')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      setAnswers((prev) => ({ ...prev, [questionId]: data.path }))
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload')
    } finally {
      setFileUploading((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setUploading(true)
    setError('')

    try {
      const responseData = {
        form_id: form.id,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        answers: answers,
        submitted_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase.from('responses').insert([responseData])

      if (insertError) throw insertError

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la soumission')
    } finally {
      setUploading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6 flex justify-center"
          >
            <CheckCircle className="h-16 w-16 text-green-400" />
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold">Merci !</h2>
          <p className="mb-6 text-gray-400">
            Votre candidature a été reçue avec succès. Nous l'analyserons rapidement.
          </p>
          <p className="text-sm text-gray-500">Un email de confirmation a été envoyé à {candidateEmail}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-4xl font-bold">{form.title}</h1>
          {form.description && <p className="text-lg text-gray-400">{form.description}</p>}
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Erreur générale */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400"
              >
                <AlertCircle className="h-5 w-5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section candidat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <h2 className="mb-4 text-lg font-semibold">Vos informations</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Nom complet <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => {
                    setCandidateName(e.target.value)
                    setValidationErrors((prev) => ({ ...prev, name: '' }))
                  }}
                  placeholder="Jean Dupont"
                  className={`w-full rounded-xl border bg-white/5 px-4 py-3 outline-none transition-colors ${
                    validationErrors.name
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-blue-500'
                  }`}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => {
                    setCandidateEmail(e.target.value)
                    setValidationErrors((prev) => ({ ...prev, email: '' }))
                  }}
                  placeholder="jean@example.com"
                  className={`w-full rounded-xl border bg-white/5 px-4 py-3 outline-none transition-colors ${
                    validationErrors.email
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-blue-500'
                  }`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Questions */}
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <label className="mb-4 block">
                <span className="text-base font-medium">
                  {question.question_text}
                  {question.required && <span className="ml-1 text-red-400">*</span>}
                </span>
              </label>

              {question.type === 'text' && (
                <div>
                  <input
                    type="text"
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => {
                      setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                      setValidationErrors((prev) => ({ ...prev, [question.id]: '' }))
                    }}
                    placeholder="Votre réponse..."
                    className={`w-full rounded-xl border bg-white/5 px-4 py-3 outline-none transition-colors ${
                      validationErrors[question.id]
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-blue-500'
                    }`}
                  />
                  {validationErrors[question.id] && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors[question.id]}</p>
                  )}
                </div>
              )}

              {question.type === 'textarea' && (
                <div>
                  <textarea
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => {
                      setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                      setValidationErrors((prev) => ({ ...prev, [question.id]: '' }))
                    }}
                    placeholder="Votre réponse..."
                    rows={5}
                    className={`w-full rounded-xl border bg-white/5 px-4 py-3 outline-none transition-colors ${
                      validationErrors[question.id]
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-blue-500'
                    }`}
                  />
                  {validationErrors[question.id] && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors[question.id]}</p>
                  )}
                </div>
              )}

              {question.type === 'select' && (
                <div>
                  <select
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => {
                      setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                      setValidationErrors((prev) => ({ ...prev, [question.id]: '' }))
                    }}
                    className={`w-full rounded-xl border bg-white/5 px-4 py-3 outline-none transition-colors ${
                      validationErrors[question.id]
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Sélectionnez une option</option>
                    {question.options?.map((option) => (
                      <option key={option} value={option} className="bg-gray-900">
                        {option}
                      </option>
                    ))}
                  </select>
                  {validationErrors[question.id] && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors[question.id]}</p>
                  )}
                </div>
              )}

              {question.type === 'file' && (
                <div>
                  <div className="rounded-xl border border-white/10 border-dashed bg-white/5 p-6 text-center transition-colors hover:border-blue-500">
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        {fileUploading[question.id] ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="text-blue-400"
                          >
                            <Loader2 className="h-6 w-6" />
                          </motion.div>
                        ) : (
                          <Upload className="h-6 w-6 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-400">
                          {answers[question.id]
                            ? '✓ Fichier ajouté'
                            : 'Cliquez ou glissez un fichier'}
                        </span>
                      </div>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(question.id, file)
                          }
                        }}
                        className="hidden"
                        disabled={fileUploading[question.id]}
                      />
                    </label>
                  </div>
                  {validationErrors[question.id] && (
                    <p className="mt-2 text-sm text-red-400">{validationErrors[question.id]}</p>
                  )}
                </div>
              )}

              {question.type === 'video_link' && (
                <div>
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={(answers[question.id] as string) || ''}
                      onChange={(e) => {
                        setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                        setValidationErrors((prev) => ({ ...prev, [question.id]: '' }))
                      }}
                      placeholder="https://youtube.com/watch?v=..."
                      className={`flex-1 rounded-xl border bg-white/5 px-4 py-3 outline-none transition-colors ${
                        validationErrors[question.id]
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-white/10 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {validationErrors[question.id] && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors[question.id]}</p>
                  )}
                </div>
              )}

              {question.type === 'scale' && (
                <div>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="1"
                      max={question.scale_max || 10}
                      value={(answers[question.id] as number) || 5}
                      onChange={(e) => {
                        setAnswers((prev) => ({ ...prev, [question.id]: parseInt(e.target.value) }))
                        setValidationErrors((prev) => ({ ...prev, [question.id]: '' }))
                      }}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>1</span>
                      <span className="text-base font-semibold text-white">
                        {answers[question.id] || 5}
                      </span>
                      <span>{question.scale_max || 10}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Bouton soumission */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + questions.length * 0.05 }}
            type="submit"
            disabled={uploading}
            className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Loader2 className="h-5 w-5" />
                </motion.div>
                Envoi...
              </div>
            ) : (
              'Soumettre ma candidature'
            )}
          </motion.button>
        </form>
      </div>
    </div>
  )
}
