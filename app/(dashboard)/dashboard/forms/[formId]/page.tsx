import { createServerSupabase } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { FormResponses } from '@/components/dashboard/form-responses'

export default async function FormDetailPage({ params }: { params: { formId: string } }) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: form } = await supabase.from('forms').select('*').eq('id', params.formId).single()

  if (!form || form.user_id !== user.id) notFound()

  const { data: responses } = await supabase
    .from('responses')
    .select('*, evaluations(*)')
    .eq('form_id', params.formId)
    .order('submitted_at', { ascending: false })

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('form_id', params.formId)
    .order('order_index')

  return <FormResponses form={form} responses={responses || []} questions={questions || []} />
}
