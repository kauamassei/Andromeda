import { useRef, useState } from 'react'
import Background from './components/Background'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PromptBar from './components/PromptBar'
import Conversation from './components/Conversation'
import { reviewCode, ApiError } from './services/api'
import type { Message } from './types'

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : String(Date.now() + Math.random())

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  function stop() {
    abortRef.current?.abort()
    abortRef.current = null
    setLoading(false)
  }

  async function handleSubmit({
    prompt,
    code,
    language,
  }: {
    prompt: string
    code: string
    language: string
  }) {
    const userMessage: Message = {
      id: newId(),
      role: 'user',
      content: prompt,
      code: code || undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const { review, report } = await reviewCode(
        { code, prompt, language },
        controller.signal,
      )

      setMessages((prev) => [
        ...prev,
        { id: newId(), role: 'assistant', content: review, report },
      ])
    } catch (err) {
      if ((err as Error).name === 'AbortError') return

      const detail =
        err instanceof ApiError ? err.message : 'Erro inesperado na requisição.'

      setMessages((prev) => [
        ...prev,
        { id: newId(), role: 'assistant', content: detail, error: true },
      ])
    } finally {
      abortRef.current = null
      setLoading(false)
    }
  }

  const started = messages.length > 0

  return (
    <div className="page">
      <Background />
      <Navbar />

      <main className={`main${started ? ' main--started' : ''}`}>
        <Hero compact={started} />
        <Conversation messages={messages} loading={loading} />
        <PromptBar loading={loading} onSubmit={handleSubmit} onStop={stop} />
      </main>

      <footer className="footer">
        Conectado a <code>/ai/review</code> — CodeReviewer API
      </footer>
    </div>
  )
}
