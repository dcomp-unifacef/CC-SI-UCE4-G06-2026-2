import { useState, type FormEvent } from 'react'
import { getErrorMessage } from '../services/api'
import type { Cliente, ClienteInput } from '../types/Cliente'
import { normalizeBrazilianPhone } from '../utils/brazilianPhone'
import { ArrowLeftIcon } from './admin/AdminIcons'
import { Select } from './ui/select'

const ORIGEM_OPTIONS = [
  { value: 'Site', label: 'Site' },
  { value: 'Indicação', label: 'Indicação' },
  { value: 'Redes sociais', label: 'Redes sociais' },
  { value: 'Telefone', label: 'Telefone' },
  { value: 'Outro', label: 'Outro' },
]

interface ClientesFormProps {
  initialValue: Cliente | null
  onSave: (input: ClienteInput) => Promise<void>
  onCancel: () => void
}

export default function ClientesForm({
  initialValue,
  onSave,
  onCancel,
}: ClientesFormProps) {
  const [name, setName] = useState(initialValue?.razaoSocialNome ?? '')
  const [document, setDocument] = useState(initialValue?.cnpjCpf ?? '')
  const [phone, setPhone] = useState(initialValue?.telefoneWhatsapp ?? '')
  const [email, setEmail] = useState(initialValue?.email ?? '')
  const [business, setBusiness] = useState(initialValue?.ramoAtuacao ?? '')
  const [origin, setOrigin] = useState(initialValue?.origemContato ?? 'Site')
  const [notes, setNotes] = useState(initialValue?.observacoes ?? '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const normalizedPhone = normalizeBrazilianPhone(phone)
    if (!normalizedPhone) {
      setError('Informe um WhatsApp brasileiro válido com DDD.')
      return
    }

    setIsSubmitting(true)

    try {
      await onSave({
        razaoSocialNome: name.trim(),
        cnpjCpf: document.trim() || null,
        telefoneWhatsapp: normalizedPhone,
        email: email.trim() || null,
        ramoAtuacao: business.trim() || null,
        origemContato: origin,
        observacoes: notes.trim() || null,
      })
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auctus-surface">
      <div className="auctus-form-header">
        <div>
          <span className="auctus-page-kicker">
            {initialValue ? 'Atualizar cadastro' : 'Novo relacionamento'}
          </span>
          <h2>{initialValue ? 'Editar cliente' : 'Adicionar cliente'}</h2>
        </div>
        <button className="auctus-btn-link" onClick={onCancel} type="button">
          <ArrowLeftIcon />
          <span>Voltar à lista</span>
        </button>
      </div>

      <form className="auctus-form" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-8">
            <label className="form-label" htmlFor="cliente-nome">
              Nome ou razão social
            </label>
            <input
              className="form-control"
              id="cliente-nome"
              maxLength={150}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Maria Clara Confecções"
              required
              value={name}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="cliente-origem">
              Origem do contato
            </label>
            <Select
              id="cliente-origem"
              onValueChange={setOrigin}
              options={ORIGEM_OPTIONS}
              value={origin}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="cliente-whatsapp">
              WhatsApp
            </label>
            <input
              className="form-control"
              id="cliente-whatsapp"
              maxLength={20}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(16) 99999-9999"
              required
              type="tel"
              value={phone}
            />
          </div>

          <div className="col-12 col-md-6">
            <label
              className="form-label d-flex justify-content-between align-items-center"
              htmlFor="cliente-documento"
            >
              <span>CPF ou CNPJ</span>
              <span className="auctus-optional">opcional</span>
            </label>
            <input
              className="form-control"
              id="cliente-documento"
              maxLength={20}
              onChange={(event) => setDocument(event.target.value)}
              value={document}
            />
          </div>

          <div className="col-12 col-md-6">
            <label
              className="form-label d-flex justify-content-between align-items-center"
              htmlFor="cliente-email"
            >
              <span>E-mail</span>
              <span className="auctus-optional">opcional</span>
            </label>
            <input
              className="form-control"
              id="cliente-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="cliente@exemplo.com"
              type="email"
              value={email}
            />
          </div>

          <div className="col-12 col-md-6">
            <label
              className="form-label d-flex justify-content-between align-items-center"
              htmlFor="cliente-ramo"
            >
              <span>Ramo de atuação</span>
              <span className="auctus-optional">opcional</span>
            </label>
            <input
              className="form-control"
              id="cliente-ramo"
              maxLength={100}
              onChange={(event) => setBusiness(event.target.value)}
              value={business}
            />
          </div>

          <div className="col-12">
            <label
              className="form-label d-flex justify-content-between align-items-center"
              htmlFor="cliente-observacoes"
            >
              <span>Observações</span>
              <span className="auctus-optional">opcional</span>
            </label>
            <textarea
              className="form-control"
              id="cliente-observacoes"
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </div>
        </div>

        {error && (
          <p className="alert alert-danger py-2 px-3 mt-3 mb-0" role="alert">
            {error}
          </p>
        )}

        <div className="auctus-form-actions">
          <button
            className="auctus-btn-secondary"
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="auctus-btn-primary"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Salvando…' : 'Salvar cliente'}
          </button>
        </div>
      </form>
    </section>
  )
}
