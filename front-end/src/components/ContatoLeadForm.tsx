import { useState, type FormEvent } from 'react'
import { createLead } from '../data/clientes'
import { getErrorMessage } from '../services/api'
import { normalizeBrazilianPhone } from '../utils/brazilianPhone'

const WHATSAPP_NUMBER = '5516993824959'
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Olá! Gostaria de conhecer melhor a Auctus Licitações.',
)
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`

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

    const normalizedPhone = normalizeBrazilianPhone(phone)
    if (!normalizedPhone) {
      setError('Informe um WhatsApp brasileiro válido com DDD.')
      return
    }

    setIsSubmitting(true)

    try {
      await createLead({
        razaoSocialNome: name.trim(),
        telefoneWhatsapp: normalizedPhone,
        email: email.trim() || null,
      })
      setMessage('Cadastro realizado com sucesso. Em breve entraremos em contato.')
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
        <span className="eyebrow eyebrow-light">Auctus Licitações</span>
        <h2>Vamos conversar sobre novas oportunidades?</h2>
        <p>Cadastre seu interesse ou fale diretamente com a nossa equipe pelo WhatsApp.</p>
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
              type="tel"
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
          {isSubmitting ? 'Cadastrando…' : 'Cadastrar interesse'}
          <svg aria-hidden="true"><use href="/icons.svg#arrow-up-right" /></svg>
        </button>
        <a
          className="btn button button-whatsapp button-full w-100"
          href={WHATSAPP_URL}
          rel="noreferrer"
          target="_blank"
        >
          Quero conversar pelo WhatsApp
          <svg aria-hidden="true"><use href="/icons.svg#arrow-up-right" /></svg>
        </a>
        <small>Seus dados são usados apenas para responder ao seu contato.</small>
      </form>
    </section>
  )
}