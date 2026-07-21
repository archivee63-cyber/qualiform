'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Upload, Video, CheckCircle, Loader2 } from 'lucide-react'

interface Question {
  id: string
  question_text: string
  question_type: string
  options: string[]
  required: boolean
  order_index: number
}

interface Form {
  id: string
  title: string
  description: string
}

export function PublicForm({ form, questions }: { form: Form; questions: Question[] }) {
  const supabase = createClient()
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, File>>({})
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!candidateName.trim()) newErrors.name = 'Nom requis'
    if (!candidateEmail.trim()) newErrors.email = 'Email requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)) newErrors.email = 'Email invalide'

    questions.forEach((q) => {
      if (q.required && !answers[q.id] && !files[q.id]) {
        newErrors[q.id] = 'Ce champ est requis'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFile = async (questionId: string, file: File) => {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    const { data, error } = await supabase.storage.from('candidate-files').upload(fileName, file)

    if (error) throw error

    const { data: publicData } = supabase.storage.from('candidate-files').getPublicUrl(fileName)
    return publicData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError('')

    if (!validate()) return

    setUploading(true)

    try {
      const uploadedUrls: Record<string, string> = {}
      for (const [questionId, file] of Object.entries(files)) {
        const url = await uploadFile(questionId, file)
        uploadedUrls[questionId] = url
      }

      const finalAnswers: Record<string, any> = {}
      for (const question of questions) {
        finalAnswers[question.id] = uploadedUrls[question.id] || answers[question.id] || ''
      }

      const videoLinks = questions
        .filter((q) => q.question_type === 'video_link' && answers[q.id])
        .map((q) => answers[q.id])

      const { error } = await supabase.from('responses').insert({
        form_id: form.id,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        answers: finalAnswers,
        files: Object.values(uploadedUrls),
        video_links: videoLinks,
      })

      if (error) throw error

      setSubmitted(true)
    } catch (err: any) {
      setGlobalError(err.message || 'Erreur lors de la soumission')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (questionId: string, file: File | null) => {
    if (file) {
      setFiles({ ...files, [questionId]: file })
      setAnswers({ ...answers, [questionId]: file.name })
      setErrors({ ...errors, [questionId]: '' })
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold">Candidature envoyée !</h2>
          <p className="text-gray-400">Nous analysons vos réponses. Vous recevrez un retour prochainement.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl p-6 md:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">{form.title}</h1>
            {form.description ? <p className="text-gray-400">{form.description}</p> : null}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div>
                <label className="mb-2 block text-sm font-medium">Nom complet *</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => {
                    setCandidateName(e.target.value)
                    setErrors({ ...errors, name: '' })
                  }}
                  className={`w-full rounded-xl border bg-white/5 p-3 outline-none ${errors.name ? 'border-red-500' : 'border-white/10'} focus:border-blue-500`}
                  placeholder="Votre nom"
                />
                {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email *</label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => {
                    setCandidateEmail(e.target.value)
                    setErrors({ ...errors, email: '' })
                  }}
                  className={`w-full rounded-xl border bg-white/5 p-3 outline-none ${errors.email ? 'border-red-500' : 'border-white/10'} focus:border-blue-500`}
                  placeholder="votre@email.com"
                />
                {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email}</p> : null}
              </div>
            </div>

            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <label className="block font-medium">
                  {question.question_text}
                  {question.required ? <span className="ml-1 text-red-400">*</span> : null}
                </label>

                {question.question_type === 'text' ? (
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => {
                      setAnswers({ ...answers, [question.id]: e.target.value })
                      setErrors({ ...errors, [question.id]: '' })
                    }}
                    className={`w-full rounded-xl border bg-white/5 p-3 outline-none ${errors[question.id] ? 'border-red-500' : 'border-white/10'} focus:border-blue-500`}
                    placeholder="Votre réponse"
                  />
                ) : null}

                {question.question_type === 'textarea' ? (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => {
                      setAnswers({ ...answers, [question.id]: e.target.value })
                      setErrors({ ...errors, [question.id]: '' })
                    }}
                    rows={4}
                    className={`w-full resize-none rounded-xl border bg-white/5 p-3 outline-none ${errors[question.id] ? 'border-red-500' : 'border-white/10'} focus:border-blue-500`}
                    placeholder="Votre réponse"
                  />
                ) : null}

                {question.question_type === 'select' ? (
                  <div className="space-y-2">
                    {question.options.map((option, i) => (
                      <label
                        key={i}
                        className={`flex cursor-pointer items-center rounded-xl border p-3 transition-colors ${answers[question.id] === option ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20'}`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => {
                            setAnswers({ ...answers, [question.id]: e.target.value })
                            setErrors({ ...errors, [question.id]: '' })
                          }}
                          className="sr-only"
                        />
                        <div className={`mr-3 flex h-4 w-4 items-center justify-center rounded-full border ${answers[question.id] === option ? 'border-blue-500' : 'border-white/30'}`}>
                          {answers[question.id] === option ? <div className="h-2 w-2 rounded-full bg-blue-500" /> : null}
                        </div>
                        {option}
                      </label>
                    ))}
                  </div>
                ) : null}

                {question.question_type === 'file' ? (
                  <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${errors[question.id] ? 'border-red-500' : 'border-white/20 hover:border-blue-500'} ${files[question.id] ? 'border-blue-500 bg-blue-500/5' : ''}`}>
                    <Upload className={`mb-2 h-8 w-8 ${files[question.id] ? 'text-blue-400' : 'text-gray-500'}`} />
                    <span className="text-sm text-gray-400">
                      {files[question.id] ? files[question.id].name : 'Cliquez ou déposez votre fichier'}
                    </span>
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(question.id, e.target.files?.[0] || null)} />
                  </label>
                ) : null}

                {question.question_type === 'video_link' ? (
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="url"
                      value={answers[question.id] || ''}
                      onChange={(e) => {
                        setAnswers({ ...answers, [question.id]: e.target.value })
                        setErrors({ ...errors, [question.id]: '' })
                      }}
                      className={`w-full rounded-xl border bg-white/5 p-3 pl-10 outline-none ${errors[question.id] ? 'border-red-500' : 'border-white/10'} focus:border-blue-500`}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                ) : null}

                {question.question_type === 'scale' ? (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={answers[question.id] || 5}
                      onChange={(e) => {
                        setAnswers({ ...answers, [question.id]: parseInt(e.target.value) })
                        setErrors({ ...errors, [question.id]: '' })
                      }}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>😞 1</span>
                      <span className="text-lg font-bold text-blue-400">{answers[question.id] || 5}/10</span>
                      <span>10 😍</span>
                    </div>
                  </div>
                ) : null}

                {errors[question.id] ? <p className="text-xs text-red-400">{errors[question.id]}</p> : null}
              </motion.div>
            ))}

            {globalError ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
                {globalError}
              </motion.div>
            ) : null}

            <button
              type="submit"
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-semibold transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Soumettre ma candidature'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
