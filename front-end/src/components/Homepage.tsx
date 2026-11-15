import ContatoLeadForm from './ContatoLeadForm'
import PortfolioCasosSucesso from './PortfolioCasosSucesso'

interface HomepageProps {
  onLogin: () => void
}

export default function Homepage({ onLogin }: HomepageProps) {
  return (
    <main className="public-page">
      <header className="site-header">
        <a aria-label="Auctus, início" className="brand" href="#inicio">
          <span aria-hidden="true" className="brand-mark">A</span>
          <span>AUCTUS</span>
        </a>
        <nav aria-label="Navegação principal" className="site-nav">
          <a href="#solucoes">Como funciona</a>
          <a href="#contato">Contato</a>
        </nav>
        <button className="button button-outline header-login" onClick={onLogin} type="button">
          Acesso da equipe
          <svg aria-hidden="true"><use href="/icons.svg#arrow-up-right" /></svg>
        </button>
      </header>

      <section className="hero-section" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> Mais clareza para fazer seu negócio avançar</span>
          <h1>Boas ideias merecem espaço para <em>crescer.</em></h1>
          <p>Clientes, agenda e próximos passos em um só lugar. Organize sua rotina e tenha mais tempo para fazer o que importa.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#contato">
              Conheça a Auctus
              <svg aria-hidden="true"><use href="/icons.svg#arrow-up-right" /></svg>
            </a>
            <a className="quiet-link" href="#solucoes">Descubra como funciona <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-note">
            <span className="note-avatars" aria-hidden="true"><i>A</i><i>F</i><i>M</i></span>
            <span>Uma rotina mais simples, do seu jeito</span>
          </div>
        </div>
        <div aria-label="Prévia ilustrativa da agenda" className="hero-visual">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="schedule-card">
            <div className="schedule-head">
              <div>
                <span className="schedule-kicker">VISÃO DA SEMANA</span>
                <h2>Seu negócio em movimento.</h2>
              </div>
              <span className="schedule-date">NOV<br /><b>15</b></span>
            </div>
            <div className="schedule-divider" />
            <div className="schedule-item">
              <span className="schedule-time">09:30</span>
              <span className="schedule-dot dot-green" />
              <div><b>Conversa com novo cliente</b><small>Mariana Costa · 30 min</small></div>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">11:00</span>
              <span className="schedule-dot dot-lime" />
              <div><b>Revisão de proposta</b><small>Equipe Aurora · 45 min</small></div>
            </div>
            <div className="schedule-item schedule-item-muted">
              <span className="schedule-time">14:30</span>
              <span className="schedule-dot dot-peach" />
              <div><b>Retorno para cliente</b><small>Próximo passo · 20 min</small></div>
            </div>
            <div className="schedule-footer">
              <span><svg aria-hidden="true"><use href="/icons.svg#check" /></svg> Tudo em um só lugar</span>
              <svg aria-hidden="true"><use href="/icons.svg#arrow-up-right" /></svg>
            </div>
          </div>
          <div className="floating-note">
            <span className="floating-icon"><svg aria-hidden="true"><use href="/icons.svg#spark" /></svg></span>
            <span><b>Mais tempo para crescer</b><small>Rotina organizada</small></span>
          </div>
          <span className="visual-caption">PLANEJE · ORGANIZE · AVANCE</span>
        </div>
      </section>

      <div className="trust-strip">
        <span>FEITA PARA QUEM FAZ ACONTECER</span>
        <p>Empreendedores <i /> Pequenas equipes <i /> Novos projetos <i /> Ideias em crescimento</p>
      </div>

      <PortfolioCasosSucesso />
      <ContatoLeadForm />
      <footer className="site-footer">
        <a aria-label="Auctus, início" className="brand" href="#inicio"><span aria-hidden="true" className="brand-mark">A</span><span>AUCTUS</span></a>
        <span>Ideias que crescem. Negócios que avançam.</span>
        <a href="#inicio">Voltar ao início ↑</a>
      </footer>
    </main>
  )
}