const highlights = [
  {
    number: '01',
    title: 'Tudo começa com organização',
    description: 'Mantenha clientes, conversas e informações importantes em um só lugar.',
    icon: '◌',
  },
  {
    number: '02',
    title: 'Uma rotina que flui',
    description: 'Visualize compromissos e próximos passos sem perder o ritmo do seu dia.',
    icon: '▦',
  },
  {
    number: '03',
    title: 'Cresça com confiança',
    description: 'Acompanhe compromissos e pendências e avance com clareza em cada etapa.',
    icon: '↗',
  },
]

export default function PortfolioCasosSucesso() {
  return (
    <section className="features-section" id="solucoes">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Seu trabalho, com mais propósito</span>
          <h2>Uma ideia de cada vez. Um passo adiante.</h2>
        </div>
        <p>A Auctus ajuda você a organizar o dia a dia para se concentrar no que realmente importa: fazer seu negócio crescer.</p>
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