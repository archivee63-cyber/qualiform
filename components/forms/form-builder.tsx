'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  GripVertical,
  Trash2,
  X,
  FileText,
  List,
  Upload,
  Video,
  Sliders,
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

type QuestionType = 'text' | 'textarea' | 'select' | 'file' | 'video_link' | 'scale'

interface Question {
  id: string
  type: QuestionType
  question: string
  required: boolean
  options: string[]
  order: number
}

interface ScoringCriterion {
  id: string
  name: string
  maxPoints: number
}

export function FormBuilder() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [criteria, setCriteria] = useState<ScoringCriterion[]>([])
  const [newCriterion, setNewCriterion] = useState({ name: '', maxPoints: 10 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type,
      question: '',
      required: false,
      options: type === 'select' ? ['Option 1'] : [],
      order: questions.length,
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q
      )
    )
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) } : q
      )
    )
  }

  const addCriterion = () => {
    if (newCriterion.name.trim()) {
      setCriteria([
        ...criteria,
        {
          id: crypto.randomUUID(),
          name: newCriterion.name,
          maxPoints: newCriterion.maxPoints,
        },
      ])
      setNewCriterion({ name: '', maxPoints: 10 })
    }
  }

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(questions)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setQuestions(items.map((item, index) => ({ ...item, order: index })))
  }

  const saveForm = async (status: 'draft' | 'published') => {
    setSaving(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Vous devez être connecté')
      setSaving(false)
      return
    }

    const { data: form, error: formError } = await supabase
      .from('forms')
      .insert({
        user_id: user.id,
        title: title || 'Formulaire sans titre',
        description,
        status,
        scoring_criteria: criteria,
      })
      .select()
      .single()

    if (formError) {
      setError(formError.message)
      setSaving(false)
      return
    }

    if (questions.length > 0) {
      const questionsData = questions.map((q, i) => ({
        form_id: form.id,
        question_text: q.question || 'Question sans titre',
        question_type: q.type,
        options: q.options,
        required: q.required,
        order_index: i,
      }))

      const { error: questionsError } = await supabase.from('questions').insert(questionsData)

      if (questionsError) {
        setError(questionsError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    router.push(`/dashboard/forms/${form.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-3xl font-bold">Nouveau formulaire</h1>

        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
          >
            {error}
          </motion.div>
        ) : null}

        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du formulaire"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-2xl font-semibold outline-none transition-colors placeholder:text-gray-500 focus:border-blue-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnelle)"
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 outline-none transition-colors placeholder:text-gray-500 focus:border-blue-500"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Critères de scoring IA</h2>
          </div>
          <p className="text-sm text-gray-400">
            Définissez comment l&apos;IA va évaluer les candidats
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCriterion.name}
              onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addCriterion()}
              placeholder="Nom du critère (ex: Expérience)"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none"
            />
            <input
              type="number"
              value={newCriterion.maxPoints}
              onChange={(e) => setNewCriterion({ ...newCriterion, maxPoints: parseInt(e.target.value) || 0 })}
              min={1}
              max={100}
              className="w-20 rounded-xl border border-white/10 bg-white/5 p-3 text-center text-sm outline-none"
            />
            <button
              onClick={addCriterion}
              className="rounded-xl bg-blue-600 p-3 transition-colors hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <AnimatePresence>
            {criteria.length > 0 ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                {criteria.map((criterion) => (
                  <motion.div
                    key={criterion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3"
                  >
                    <span className="text-sm">{criterion.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-blue-400">{criterion.maxPoints} pts</span>
                      <button onClick={() => removeCriterion(criterion.id)} className="text-red-400 transition-colors hover:text-red-300">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Questions</h2>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  <AnimatePresence>
                    {questions.map((question, index) => (
                      <Draggable key={question.id} draggableId={question.id} index={index}>
                        {(provided) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                          >
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical className="h-5 w-5 text-gray-500" />
                              </div>
                              <input
                                type="text"
                                value={question.question}
                                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                placeholder="Votre question"
                                className="flex-1 border-b border-white/10 bg-transparent p-2 text-sm outline-none focus:border-blue-500"
                              />
                              <select
                                value={question.type}
                                onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                                className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm outline-none"
                              >
                                <option value="text">Texte court</option>
                                <option value="textarea">Texte long</option>
                                <option value="select">Choix multiple</option>
                                <option value="file">Fichier</option>
                                <option value="video_link">Lien vidéo</option>
                                <option value="scale">Échelle</option>
                              </select>
                              <button onClick={() => removeQuestion(question.id)} className="text-red-400 transition-colors hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {question.type === 'select' ? (
                              <div className="space-y-2 pl-8">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...question.options]
                                        newOptions[optIndex] = e.target.value
                                        updateQuestion(question.id, 'options', newOptions)
                                      }}
                                      className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2 text-sm outline-none"
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                    <button onClick={() => removeOption(question.id, optIndex)} className="text-red-400 hover:text-red-300">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                                <button onClick={() => addOption(question.id)} className="text-sm text-blue-400 transition-colors hover:text-blue-300">
                                  + Ajouter une option
                                </button>
                              </div>
                            ) : null}

                            <div className="flex items-center gap-2 pl-8">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                                className="rounded border-white/20 bg-white/5"
                              />
                              <span className="text-xs text-gray-400">Obligatoire</span>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="flex flex-wrap gap-2">
            {([
              { type: 'text' as QuestionType, icon: FileText, label: 'Texte court' },
              { type: 'textarea' as QuestionType, icon: FileText, label: 'Texte long' },
              { type: 'select' as QuestionType, icon: List, label: 'Choix multiple' },
              { type: 'file' as QuestionType, icon: Upload, label: 'Fichier' },
              { type: 'video_link' as QuestionType, icon: Video, label: 'Lien vidéo' },
              { type: 'scale' as QuestionType, icon: Sliders, label: 'Échelle' },
            ]).map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => addQuestion(type)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end gap-3 border-t border-white/10 pt-4"
        >
          <button
            onClick={() => saveForm('draft')}
            disabled={saving}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Brouillon'}
          </button>
          <button
            onClick={() => saveForm('published')}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Publication...' : 'Publier'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
