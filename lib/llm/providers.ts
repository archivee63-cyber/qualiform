import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type LLMProvider = 'openai' | 'anthropic' | 'groq' | 'gemini' | 'deepseek'

interface Criterion {
  name: string
  maxPoints: number
}

interface EvaluationPrompt {
  criteria: Criterion[]
  answers: Record<string, string>
  candidateName: string
  files: string[]
  videoLinks: string[]
}

interface CriterionScore {
  name: string
  score: number
  maxScore: number
}

export interface EvaluationResult {
  totalScore: number
  maxScore: number
  criteria: CriterionScore[]
  strengths: string[]
  weaknesses: string[]
  justification: string
}

const SYSTEM_PROMPT = `Tu es un expert en recrutement et évaluation de candidats.
Analyse les réponses du candidat selon les critères fournis.
Sois objectif, précis et constructif.

Format JSON obligatoire :
{
  "totalScore": number (somme des scores des critères),
  "maxScore": number (somme des maxPoints),
  "criteria": [
    {
      "name": string (nom exact du critère),
      "score": number (entre 0 et maxPoints),
      "maxScore": number
    }
  ],
  "strengths": string[] (3-5 qualités ou points forts observés),
  "weaknesses": string[] (2-4 axes d'amélioration),
  "justification": string (analyse détaillée en 3-5 phrases)
}`

function buildUserPrompt(prompt: EvaluationPrompt): string {
  return `Évalue ce candidat : ${prompt.candidateName}

CRITÈRES D'ÉVALUATION :
${prompt.criteria.map((c) => `- ${c.name} (sur ${c.maxPoints} points)`).join('\n')}

RÉPONSES DU CANDIDAT :
${Object.entries(prompt.answers)
  .map(([q, a]) => `Question: ${q}\nRéponse: ${a}`)
  .join('\n\n')}

${prompt.files.length > 0 ? `FICHIERS FOURNIS : ${prompt.files.join(', ')}` : ''}
${prompt.videoLinks.length > 0 ? `LIENS VIDÉO : ${prompt.videoLinks.join(', ')}` : ''}

Analyse les réponses et attribue un score pour chaque critère.`
}

function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/```/g, '')
    .trim()
}

async function evaluateWithOpenAI(apiKey: string, model: string, prompt: EvaluationPrompt): Promise<EvaluationResult> {
  const openai = new OpenAI({ apiKey, timeout: 30000, maxRetries: 2 })

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(prompt) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2000,
  })

  const content = completion.choices[0].message.content || '{}'
  return JSON.parse(cleanJsonResponse(content))
}

async function evaluateWithAnthropic(apiKey: string, model: string, prompt: EvaluationPrompt): Promise<EvaluationResult> {
  const anthropic = new Anthropic({ apiKey, timeout: 30000, maxRetries: 2 })

  const msg = await anthropic.messages.create({
    model,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(prompt) }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  return JSON.parse(cleanJsonResponse(text))
}

async function evaluateWithGroq(apiKey: string, model: string, prompt: EvaluationPrompt): Promise<EvaluationResult> {
  const groq = new Groq({ apiKey, timeout: 30000, maxRetries: 2 })

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(prompt) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2000,
  })

  const content = completion.choices[0].message.content || '{}'
  return JSON.parse(cleanJsonResponse(content))
}

async function evaluateWithGemini(apiKey: string, model: string, prompt: EvaluationPrompt): Promise<EvaluationResult> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const geminiModel = genAI.getGenerativeModel({
    model,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
  })

  const result = await geminiModel.generateContent([SYSTEM_PROMPT + '\n\n' + buildUserPrompt(prompt)])
  const response = await result.response
  const text = response.text()
  return JSON.parse(cleanJsonResponse(text))
}

async function evaluateWithDeepSeek(apiKey: string, model: string, prompt: EvaluationPrompt): Promise<EvaluationResult> {
  const deepseek = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com/v1',
    timeout: 30000,
    maxRetries: 2,
  })

  const completion = await deepseek.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(prompt) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2000,
  })

  const content = completion.choices[0].message.content || '{}'
  return JSON.parse(cleanJsonResponse(content))
}

export async function evaluateCandidate(
  provider: LLMProvider,
  apiKey: string,
  model: string,
  prompt: EvaluationPrompt
): Promise<EvaluationResult> {
  try {
    switch (provider) {
      case 'openai':
        return await evaluateWithOpenAI(apiKey, model, prompt)
      case 'anthropic':
        return await evaluateWithAnthropic(apiKey, model, prompt)
      case 'groq':
        return await evaluateWithGroq(apiKey, model, prompt)
      case 'gemini':
        return await evaluateWithGemini(apiKey, model, prompt)
      case 'deepseek':
        return await evaluateWithDeepSeek(apiKey, model, prompt)
      default:
        throw new Error(`Provider "${provider}" non supporté. Utilisez : openai, anthropic, groq, gemini, deepseek`)
    }
  } catch (error: any) {
    console.error(`Erreur LLM (${provider}):`, error)

    if (error?.status === 401 || error?.message?.includes('API key')) {
      throw new Error('Clé API invalide. Vérifiez votre clé dans les paramètres.')
    }
    if (error?.status === 429 || error?.message?.includes('rate')) {
      throw new Error('Limite de requêtes atteinte. Réessayez dans quelques instants.')
    }
    if (error?.message?.includes('timeout') || error?.code === 'ETIMEDOUT') {
      throw new Error('Le fournisseur LLM met trop de temps à répondre. Réessayez.')
    }

    throw new Error(`Erreur d'évaluation : ${error.message || 'Erreur inconnue'}`)
  }
}

export function rankCandidates(evaluations: (EvaluationResult & { candidateName: string; candidateEmail: string })[]) {
  return evaluations
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((evaluation, index) => ({
      rank: index + 1,
      ...evaluation,
    }))
}
