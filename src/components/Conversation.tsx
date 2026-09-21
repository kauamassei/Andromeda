import { useEffect, useRef } from 'react'
import ReviewReport from './ReviewReport'
import type { Message } from '../types'

interface ConversationProps {
  messages: Message[]
  loading: boolean
}

/**
 * Renderização leve do texto do modelo: separa blocos ```...``` do restante,
 * sem dependência de biblioteca de markdown. Usada como fallback quando a
 * resposta não é o JSON estruturado de revisão.
 */
function renderContent(text: string) {
  const parts = text.split(/```/)

  return parts.map((part, index) => {
    const isCode = index % 2 === 1
    if (!part.trim()) return null

    if (isCode) {
      const [first, ...rest] = part.split('\n')
      const hasLangTag = /^[a-zA-Z0-9+#-]*$/.test(first.trim()) && rest.length > 0
      const body = hasLangTag ? rest.join('\n') : part

      return (
        <pre className="msg-code" key={index}>
          <code>{body.replace(/\n$/, '')}</code>
        </pre>
      )
    }

    return (
      <div className="msg-text" key={index}>
        {part
          .split('\n')
          .filter((line) => line.trim() !== '')
          .map((line, i) => (
            <p key={i}>{line.replace(/\*\*/g, '')}</p>
          ))}
      </div>
    )
  })
}

export default function Conversation({ messages, loading }: ConversationProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  if (messages.length === 0) return null

  return (
    <div className="thread">
      {messages.map((msg) => (
        <article
          key={msg.id}
          className={`msg msg--${msg.role}${msg.error ? ' msg--error' : ''}`}
        >
          <div className="msg-role">
            {msg.role === 'user' ? 'Você' : 'Revisão'}
          </div>

          <div className="msg-body">
            {msg.report ? (
              <ReviewReport report={msg.report} />
            ) : (
              msg.content && renderContent(msg.content)
            )}

            {msg.code && (
              <pre className="msg-code">
                <code>{msg.code}</code>
              </pre>
            )}
          </div>

          {msg.role === 'assistant' && !msg.error && (
            <button
              type="button"
              className="link-btn msg-copy"
              onClick={() => navigator.clipboard.writeText(msg.content)}
            >
              Copiar revisão
            </button>
          )}
        </article>
      ))}

      {loading && (
        <article className="msg msg--assistant">
          <div className="msg-role">Revisão</div>
          <div className="msg-body">
            <div className="typing" aria-label="Analisando o código">
              <span />
              <span />
              <span />
            </div>
          </div>
        </article>
      )}

      <div ref={endRef} />
    </div>
  )
}
