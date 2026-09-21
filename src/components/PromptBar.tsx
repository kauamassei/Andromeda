import { useEffect, useRef, useState } from 'react'

const LANGUAGES = [
  'auto',
  'java',
  'typescript',
  'javascript',
  'python',
  'go',
  'c#',
  'sql',
]

interface PromptBarProps {
  loading: boolean
  onSubmit: (data: { prompt: string; code: string; language: string }) => void
  onStop: () => void
}

export default function PromptBar({ loading, onSubmit, onStop }: PromptBarProps) {
  const [prompt, setPrompt] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('auto')
  const [codeOpen, setCodeOpen] = useState(false)

  const promptRef = useRef<HTMLTextAreaElement>(null)
  const codeRef = useRef<HTMLTextAreaElement>(null)

  // Cresce com o conteúdo, até o limite definido no CSS.
  useEffect(() => {
    const el = promptRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }, [prompt])

  useEffect(() => {
    if (codeOpen) codeRef.current?.focus()
  }, [codeOpen])

  const canSend = !loading && (prompt.trim() !== '' || code.trim() !== '')

  function send() {
    if (!canSend) return
    onSubmit({ prompt: prompt.trim(), code: code.trim(), language })
    setPrompt('')
    // O código fica no campo para você iterar sobre o mesmo trecho.
  }

  function handlePromptKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function handleCodePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    // Mantém a indentação do que foi colado; o navegador já faz isso,
    // aqui só garantimos que o painel permaneça aberto.
    if (e.clipboardData.getData('text').includes('\n')) setCodeOpen(true)
  }

  return (
    <div className="composer">
      {codeOpen && (
        <div className="composer-code">
          <div className="composer-code-head">
            <select
              className="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Linguagem do código"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'auto' ? 'detectar linguagem' : lang}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setCode('')
                setCodeOpen(false)
              }}
            >
              Remover código
            </button>
          </div>

          <textarea
            ref={codeRef}
            className="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onPaste={handleCodePaste}
            spellCheck={false}
            placeholder="Cole aqui o código que você quer revisar"
            rows={8}
          />
        </div>
      )}

      <div className="composer-row">
        {!codeOpen && (
          <button
            type="button"
            className="icon-btn"
            onClick={() => setCodeOpen(true)}
            title="Adicionar código"
            aria-label="Adicionar código"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M9 7 4 12l5 5M15 7l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <textarea
          ref={promptRef}
          className="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handlePromptKey}
          rows={1}
          placeholder="O que você quer que eu analise neste código?"
        />

        {loading ? (
          <button type="button" className="send-btn send-btn--stop" onClick={onStop}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
            </svg>
            <span className="sr-only">Parar</span>
          </button>
        ) : (
          <button
            type="button"
            className="send-btn"
            onClick={send}
            disabled={!canSend}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M12 19V5m0 0-6 6m6-6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sr-only">Enviar</span>
          </button>
        )}
      </div>

      <p className="composer-hint">
        Enter envia, Shift + Enter quebra linha.
      </p>
    </div>
  )
}
