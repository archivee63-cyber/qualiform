import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { evaluateCandidate } from '@/lib/llm/providers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { responseId } = body

    if (!responseId) {
      return NextResponse.json({ error: 'responseId requis' }, { status: 400 })
    }

    const { data: response, error: respError } = await supabase
      .from('responses')
      .select('*')
      .eq('id', responseId)
      .single()

    if (respError || !response) {
      return NextResponse.json({ error: 'Réponse non trouvée' }, { status: 404 })
    }

    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*, questions(*)')
      .eq('id', response.form_id)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: 'Formulaire non trouvé' }, { status: 404 })
    }

    if (form.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings?.llm_api_key) {
      return NextResponse.json(
        {
          error: 'Clé API LLM non configurée. Allez dans Paramètres pour configurer votre clé API.',
        },
        { status: 400 }
      )
    }

    const prompt = {
      criteria: form.scoring_criteria || [],
      answers: response.answers || {},
      candidateName: response.candidate_name || 'Candidat',
      files: response.files || [],
      videoLinks: response.video_links || [],
    }

    console.log(`Évaluation du candidat ${response.candidate_name} avec ${settings.llm_provider} (${settings.llm_model})`)

    const evaluation = await evaluateCandidate(
      settings.llm_provider,
      settings.llm_api_key,
      settings.llm_model,
      prompt
    )

    console.log(`Score: ${evaluation.totalScore}/${evaluation.maxScore}`)

    const { data: savedEval, error: evalError } = await supabase
      .from('evaluations')
      .upsert(
        {
          response_id: responseId,
          total_score: evaluation.totalScore,
          max_score: evaluation.maxScore,
          scores_by_criteria: evaluation.criteria,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          justification: evaluation.justification,
          llm_used: settings.llm_model,
        },
        {
          onConflict: 'response_id',
        }
      )
      .select()
      .single()

    if (evalError) {
      console.error('Erreur sauvegarde évaluation:', evalError)
      throw new Error("Erreur lors de la sauvegarde de l'évaluation")
    }

    let notificationSent = false

    if (settings.email_notifications && evaluation.totalScore >= settings.scoring_threshold) {
      const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).single()

      if (profile?.email) {
        try {
          await resend.emails.send({
            from: 'Qualiform <notifications@qualiform.fr>',
            to: profile.email,
            subject: `🏆 Candidat qualifié : ${response.candidate_name} - ${evaluation.totalScore}/${evaluation.maxScore}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"></head>
              <body style="background:#000; color:#fff; font-family:sans-serif; padding:40px;">
                <div style="max-width:600px; margin:0 auto; background:#111; border-radius:16px; padding:32px; border:1px solid #222;">
                  <h1 style="color:#3b82f6; margin-bottom:24px;">Qualiform</h1>

                  <div style="background:#1a1a1a; border-radius:12px; padding:24px; margin-bottom:24px; text-align:center;">
                    <p style="color:#888; margin:0 0 8px 0;">Score du candidat</p>
                    <h2 style="font-size:48px; margin:0; color:#22c55e;">${evaluation.totalScore}/${evaluation.maxScore}</h2>
                  </div>

                  <h2 style="margin-bottom:8px;">${response.candidate_name}</h2>
                  <p style="color:#888; margin-bottom:24px;">${response.candidate_email}</p>

                  <h3 style="color:#22c55e;">✅ Points forts</h3>
                  <ul style="padding-left:20px;">
                    ${evaluation.strengths.map((s) => `<li style="margin-bottom:8px; color:#ccc;">${s}</li>`).join('')}
                  </ul>

                  <h3 style="color:#f59e0b;">⚠️ Axes d'amélioration</h3>
                  <ul style="padding-left:20px;">
                    ${evaluation.weaknesses.map((w) => `<li style="margin-bottom:8px; color:#ccc;">${w}</li>`).join('')}
                  </ul>

                  <h3 style="color:#3b82f6;">📝 Analyse détaillée</h3>
                  <p style="color:#ccc; line-height:1.6;">${evaluation.justification}</p>

                  <div style="margin-top:24px; padding-top:24px; border-top:1px solid #222;">
                    <p style="color:#666; font-size:12px;">
                      Évalué par ${settings.llm_model} • Seuil de notification : ${settings.scoring_threshold}/100
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `,
          })

          await supabase.from('notifications').insert({
            user_id: user.id,
            response_id: responseId,
            evaluation_id: savedEval.id,
            sent_to: profile.email,
          })

          notificationSent = true
          console.log(`Notification envoyée à ${profile.email}`)
        } catch (emailError) {
          console.error('Erreur envoi email:', emailError)
        }
      }
    }

    return NextResponse.json({
      evaluation: savedEval,
      notificationSent,
      thresholdExceeded: evaluation.totalScore >= settings.scoring_threshold,
    })
  } catch (error: any) {
    console.error('Erreur API evaluate:', error)
    return NextResponse.json(
      { error: error.message || "Erreur interne lors de l'évaluation" },
      { status: 500 }
    )
  }
}
