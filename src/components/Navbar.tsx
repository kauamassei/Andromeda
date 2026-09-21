const LINKS = [ 'Documentação']

export default function Navbar() {
  return (
    <header className="nav">
      <a className="nav-logo" href="/">
        Andromeda
      </a>

      <nav className="nav-links" aria-label="Principal">
        {LINKS.map((link) => (
          <a key={link} href="#" className="nav-link">
            {link}
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <a
          className="btn btn--primary btn--sm"
          href="https://github.com/kauamassei/CodeReviewer"
          target="_blank"
          rel="noreferrer"
        >
          Ver no GitHub
        </a>
        
      </div>
    </header>
  )
}
