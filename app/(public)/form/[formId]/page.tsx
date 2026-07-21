import { createServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicForm } from '@/components/forms/public-form'

export async function generateMetadata({ params }: { params: { formId: string } }) {
  const supabase = await createServerSupabase()
  const { data: form } = await supabase.from('forms').select('title').eq('id', params.formId).single()

  return {
    title: form?.title || 'Formulaire',
    description: 'Postulez en remplissant ce formulaire',
  }
}

export default async function FormPage({ params }: { params: { formId: string } }) {
  const supabase = await createServerSupabase()

  const { data: form } = await supabase.from('forms').select('*').eq('id', params.formId).single()

  if (!form || form.status !== 'published') {
    notFound()
  }

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('form_id', params.formId)
    .order('order_index')

  return <PublicForm form={form} questions={questions || []} />
}
