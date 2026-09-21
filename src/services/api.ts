import type { ReviewIssue, ReviewReport, ReviewRequest, ReviewResponse } from '../types'

/**
 * ÚNICO PONTO DE ACOPLAMENTO COM O BACKEND.
 *
 *   POST {BASE}/ai/review
 *   body: { "code": "...", "prompt": "...", "language": "..." }
 *
 * O backend hoje repassa o envelope cru da API do Gemini:
 *   { candidates: [ { content: { parts: [ { text: "<JSON escapado>" } ] } } ] }
 * e dentro de `text` vem outro JSON com { score, summary, issues }.
 * As duas camadas são desempacotadas aqui.
 */

const BASE = import.meta.env.VITE_API_URL ?? ''

const REVIEW_ENDPOINT = `${BASE}/ai/review`

function buildBody(req: ReviewRequest): string {
  return JSON.stringify({
    code: req.code,
    prompt: req.prompt ?? '',
    language: req.language ?? 'auto',
  })
}

/** Nomes de campo mais comuns quando o backend já devolve só o texto. */
const TEXT_KEYS = [
  'review',
  'result',
  'response',
  'content',
  'message',
  'text',
  'analysis',
  'output',
]

/** Remove cercas ```json ... ``` que o modelo às vezes adiciona. */
function stripFences(text: string): string {
  const match = text.trim().match(/^```[a-zA-Z]*\n([\s\S]*?)\n?```$/)
  return match ? match[1] : text
}

/**
 * Camada 1: tira o texto de dentro do envelope do Gemini
 * (ou de um DTO simples, se você mudar o backend depois).
 */
function extractText(payload: unknown): string {
  if (typeof payload === 'string') return payload

  if (!payload || typeof payload !== 'object') return String(payload)

  const obj = payload as Record<string, any>

  // Envelope do Gemini
  const parts = obj?.candidates?.[0]?.content?.parts
  if (Array.isArray(parts)) {
    const joined = parts
      .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
      .filter(Boolean)
      .join('\n')
    if (joined.trim()) return joined
  }

  // Bloqueio de segurança do Gemini, sem candidates
  const blockReason = obj?.promptFeedback?.blockReason
  if (typeof blockReason === 'string') {
    return `O Gemini recusou a requisição (${blockReason}).`
  }

  for (const key of TEXT_KEYS) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim()) return value
  }

  return JSON.stringify(payload, null, 2)
}

function normalizeIssue(raw: any): ReviewIssue {
  return {
    type: raw?.type ?? raw?.category ?? raw?.kind,
    severity:
      typeof raw?.severity === 'string' ? raw.severity.toLowerCase() : raw?.level,
    description: raw?.description ?? raw?.message ?? raw?.detail,
    suggestion: raw?.suggestion ?? raw?.fix ?? raw?.recommendation,
    line: raw?.line ?? raw?.lineNumber,
  }
}

/**
 * Camada 2: o texto do modelo costuma ser um JSON com score/summary/issues.
 * Se não for, devolve undefined e a mensagem cai no modo texto.
 */
function parseReport(text: string): ReviewReport | undefined {
  let parsed: any
  try {
    parsed = JSON.parse(stripFences(text))
  } catch {
    return undefined
  }

  if (!parsed || typeof parsed !== 'object') return undefined

  const hasShape =
    'score' in parsed || 'summary' in parsed || Array.isArray(parsed.issues)
  if (!hasShape) return undefined

  return {
    score: typeof parsed.score === 'number' ? parsed.score : undefined,
    summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
    issues: Array.isArray(parsed.issues)
      ? parsed.issues.map(normalizeIssue)
      : [],
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function reviewCode(
  req: ReviewRequest,
  signal?: AbortSignal,
): Promise<ReviewResponse> {
  let res: Response

  try {
    res = await fetch(REVIEW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain',
      },
      body: buildBody(req),
      signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiError(
      'Não foi possível falar com a API. Verifique se o backend está rodando em localhost:8080.',
    )
  }

  const bodyText = await res.text()

  if (!res.ok) {
    throw new ApiError(
      bodyText?.slice(0, 400) || `A API respondeu ${res.status}.`,
      res.status,
    )
  }

  let payload: unknown = bodyText
  try {
    payload = JSON.parse(bodyText)
  } catch {
    // resposta em texto puro, segue com a string
  }

  const text = extractText(payload)
  const report = parseReport(text)

  return { review: text, report, raw: payload }
}
