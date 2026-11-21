import ContatoLeadForm from './ContatoLeadForm'
import PortfolioCasosSucesso from './PortfolioCasosSucesso'

interface HomepageProps {
  onLogin: () => void
}

export default function Homepage({ onLogin }: HomepageProps) {
  return (
    <main className="public-page container-xl px-3 px-md-4">
      <header className="site-header">
        <a aria-label="Auctus, início" className="brand" href="#inicio">
          <img alt="" className="brand-logo" src="/logo-auctus.png" />
        </a>
        <nav aria-label="Navegação principal" className="site-nav">
          <a href="#empresa">A empresa</a>
          <a href="#contato">Contato</a>
        </nav>
        <button className="btn button button-outline header-login" onClick={onLogin} type="button">
          Acesso da equipe
          <svg aria-hidden="true"><use href="/icons.svg#arrow-up-right" /></svg>
        </button>
      </header>

      <section className="hero-section" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> AUCTUS LICITAÇÕES</span>
          <h1>Sua empresa pronta para avançar em <em>licitações.</em></h1>
          <p>Conheça a Auctus Licitações e descubra como nossa equipe pode apoiar sua empresa em novas oportunidades.</p>
          <div className="hero-actions">
            <a className="btn button button-dark text-decoration-none" href="#contato">
              Fale com a Auctus
              <svg aria-hidden="true"><use href="/icons.svg#arrow-up-right" /></svg>
            </a>
            <a className="quiet-link" href="#empresa">Conheça a empresa <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-note">
            <span className="note-avatars" aria-hidden="true"><i>A</i><i>L</i></span>
            <span>Assessoria e atendimento para sua empresa</span>
          </div>
        </div>
        <div aria-label="Apresentação institucional da Auctus Licitações" className="hero-visual">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="schedule-card">
            <div className="schedule-head">
              <div>
                <span className="schedule-kicker">AUCTUS LICITAÇÕES</span>
                <h2>Novas oportunidades para sua empresa.</h2>
              </div>
              <span className="schedule-date">A<br /><b>+</b></span>
            </div>
            <div className="schedule-divider" />
            <div className="schedule-item">
              <span className="schedule-time">01</span>
              <span className="schedule-dot dot-green" />
              <div><b>Conheça nossa atuação</b><small>Licitações e oportunidades</small></div>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">02</span>
              <span className="schedule-dot dot-lime" />
              <div><b>Conte sobre sua empresa</b><small>Estamos prontos para ouvir</small></div>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">03</span>
              <span className="schedule-dot dot-peach" />
              <div><b>Converse com a Auctus</b><small>Fale diretamente com nossa equipe</small></div>
            </div>
            <div className="schedule-footer">
              <span><svg aria-hidden="true"><use href="/icons.svg#check" /></svg> Auctus Licitações</span>
              <svg aria-hidden="true"><use href="/icons.svg#arrow-up-right" /></svg>
            </div>
          </div>
          <div className="floating-note">
            <span className="floating-icon"><svg aria-hidden="true"><use href="/icons.svg#spark" /></svg></span>
            <span><b>Vamos conversar?</b><small>Estamos à disposição</small></span>
          </div>
          <span className="visual-caption">AUCTUS · LICITAÇÕES · OPORTUNIDADES</span>
        </div>
      </section>

      <div className="trust-strip">
        <span>AUCTUS LICITAÇÕES</span>
        <p>Conheça a empresa <i /> Tire suas dúvidas <i /> Cadastre seu interesse</p>
      </div>

      <PortfolioCasosSucesso />
      <ContatoLeadForm />
      <footer className="site-footer">
        <a aria-label="Auctus, início" className="brand" href="#inicio">
          <span aria-hidden="true" className="brand-mark">A</span>
          <span>AUCTUS LICITAÇÕES</span>
        </a>
        <span>Auctus Licitações · novas oportunidades para sua empresa</span>
        <a href="#inicio">Voltar ao início ↑</a>
      </footer>
    </main>
  )
}