export interface ReviewRequest {
  /** Código enviado para análise. */
  code: string
  /** Instrução livre digitada pelo usuário na barra de prompt. */
  prompt?: string
  /** Linguagem selecionada (opcional, ajuda o Gemini a contextualizar). */
  language?: string
}

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export interface ReviewIssue {
  type?: string
  severity?: Severity | string
  description?: string
  suggestion?: string
  line?: number | string
}

/** Relatório já desempacotado do envelope do Gemini. */
export interface ReviewReport {
  score?: number
  summary?: string
  issues?: ReviewIssue[]
}

export interface ReviewResponse {
  /** Texto da revisão, usado quando não dá para estruturar. */
  review: string
  /** Relatório estruturado, quando o JSON do modelo foi reconhecido. */
  report?: ReviewReport
  /** Resposta crua, caso você precise inspecionar outros campos. */
  raw?: unknown
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  report?: ReviewReport
  /** Trecho de código enviado junto com a mensagem do usuário. */
  code?: string
  error?: boolean
}
