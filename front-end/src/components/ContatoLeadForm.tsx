import { useState, type FormEvent } from 'react'
import { createLead } from '../data/clientes'
import { getErrorMessage } from '../services/api'

export default function ContatoLeadForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSubmitting(true)

    try {
      await createLead({
        razaoSocialNome: name.trim(),
        telefoneWhatsapp: phone.trim(),
        email: email.trim() || null,
      })
      setMessage('Recebemos seus dados. Em breve entraremos em contato.')
      setName('')
      setPhone('')
      setEmail('')
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="contact-section" id="contato">
      <div className="contact-copy">
        <span className="eyebrow eyebrow-light">Vamos construir juntos</span>
        <h2>Seu próximo passo começa com uma conversa.</h2>
        <p>Conte um pouco sobre seu negócio. Nossa equipe retorna pelo WhatsApp ou e-mail.</p>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label className="form-label">
          Seu nome ou empresa
          <input
            autoComplete="name"
            className="form-control"
            maxLength={150}
            onChange={(event) => setName(event.target.value)}
            placeholder="Como podemos chamar você?"
            required
            value={name}
          />
        </label>
        <div className="contact-fields">
          <label className="form-label">
            WhatsApp
            <input
              autoComplete="tel"
              className="form-control"
              maxLength={20}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(11) 99999-9999"
              required
              value={phone}
            />
          </label>
          <label className="form-label">
            <span className="d-flex justify-content-between align-items-center"><span>E-mail</span> <span className="optional-label">opcional</span></span>
            <input
              autoComplete="email"
              className="form-control"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              type="email"
              value={email}
            />
          </label>
        </div>
        {message && <p className="alert alert-success form-success py-2 px-3 my-2" role="status">{message}</p>}
        {error && <p className="alert alert-danger form-error py-2 px-3 my-2" role="alert">{error}</p>}
        <button className="btn button button-lime button-full w-100 mt-2" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Enviando…' : 'Quero conversar'}
          <svg aria-hidden="true"><use href="/icons.svg#arrow-up-right" /></svg>
        </button>
        <small>Seus dados são usados apenas para responder ao seu contato.</small>
      </form>
    </section>
  )
}