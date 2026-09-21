interface HeroProps {
  /** Quando há conversa em andamento, o hero encolhe para dar espaço. */
  compact: boolean
}

export default function Hero({ compact }: HeroProps) {
  return (
    <section className={`hero${compact ? ' hero--compact' : ''}`}>
      <h1 className="hero-title">
        Revise seu código
        <br />
         com o <span className="hero-title-accent">Andromeda</span>
      </h1>

      <p className="hero-sub">
        Cole um trecho de código, diga o que você quer olhar e receba uma
        revisão com bugs, riscos e sugestões de refatoração.
      </p>
    </section>
  )
}
