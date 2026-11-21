const highlights = [
  {
    number: '01',
    title: 'Auctus Licitações',
    description: 'Conheça a empresa e sua atuação no universo das licitações.',
    icon: 'A',
  },
  {
    number: '02',
    title: 'Oportunidades para sua empresa',
    description: 'Converse com a equipe para entender como a Auctus pode apoiar seus objetivos.',
    icon: '↗',
  },
  {
    number: '03',
    title: 'Atendimento próximo',
    description: 'Cadastre seu interesse e fale diretamente com a Auctus pelo WhatsApp.',
    icon: '◌',
  },
]

export default function PortfolioCasosSucesso() {
  return (
    <section className="features-section" id="empresa">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Conheça a Auctus</span>
          <h2>Parcerias que abrem novos caminhos.</h2>
        </div>
        <p>A Auctus Licitações está pronta para conversar com empresas interessadas em conhecer sua atuação e explorar novas oportunidades.</p>
      </div>
      <div className="feature-grid">
        {highlights.map((item) => (
          <article className="feature-card" key={item.number}>
            <div className="feature-card-top">
              <span className="feature-icon" aria-hidden="true">{item.icon}</span>
              <span className="feature-number">{item.number}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span className="feature-line" />
          </article>
        ))}
      </div>
    </section>
  )
}