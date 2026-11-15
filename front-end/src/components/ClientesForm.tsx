import { useState, type FormEvent } from 'react'
import type { Cliente, ClienteInput } from '../types/Cliente'
import { getErrorMessage } from '../services/api'

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
    setIsSubmitting(true)

    try {
      await onSave({
        razaoSocialNome: name.trim(),
        cnpjCpf: document.trim() || null,
        telefoneWhatsapp: phone.trim(),
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
    <section className="editor-panel">
      <div className="editor-heading">
        <div>
          <span className="eyebrow">{initialValue ? 'Atualizar cadastro' : 'Novo relacionamento'}</span>
          <h2>{initialValue ? 'Editar cliente' : 'Adicionar cliente'}</h2>
        </div>
        <button className="text-button" onClick={onCancel} type="button">Voltar à lista</button>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field-wide">
            Nome ou razão social
            <input maxLength={150} onChange={(event) => setName(event.target.value)} required value={name} />
          </label>
          <label>
            WhatsApp
            <input maxLength={20} onChange={(event) => setPhone(event.target.value)} required value={phone} />
          </label>
          <label>
            CPF ou CNPJ <span className="optional-label">opcional</span>
            <input maxLength={20} onChange={(event) => setDocument(event.target.value)} value={document} />
          </label>
          <label>
            E-mail <span className="optional-label">opcional</span>
            <input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </label>
          <label>
            Ramo de atuação <span className="optional-label">opcional</span>
            <input maxLength={100} onChange={(event) => setBusiness(event.target.value)} value={business} />
          </label>
          <label>
            Origem do contato
            <select onChange={(event) => setOrigin(event.target.value)} value={origin}>
              <option>Site</option>
              <option>Indicação</option>
              <option>Redes sociais</option>
              <option>Telefone</option>
              <option>Outro</option>
            </select>
          </label>
          <label className="field-wide">
            Observações <span className="optional-label">opcional</span>
            <textarea maxLength={2000} onChange={(event) => setNotes(event.target.value)} rows={4} value={notes} />
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="button button-outline" onClick={onCancel} type="button">Cancelar</button>
          <button className="button button-dark" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Salvando…' : 'Salvar cliente'}
          </button>
        </div>
      </form>
    </section>
  )
}