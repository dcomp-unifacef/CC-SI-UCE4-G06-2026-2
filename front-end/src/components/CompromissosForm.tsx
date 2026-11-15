import { useEffect, useState, type FormEvent } from 'react'
import { listCategorias } from '../data/categoriasCompromisso'
import { listClientes } from '../data/clientes'
import type { CategoriaCompromisso } from '../types/CategoriaCompromisso'
import type { Cliente } from '../types/Cliente'
import type { Compromisso, CompromissoInput } from '../types/Compromisso'
import { getErrorMessage } from '../services/api'

interface CompromissosFormProps {
  initialValue: Compromisso | null
  administratorId: number
  onSave: (input: CompromissoInput) => Promise<void>
  onCancel: () => void
}

function toLocalDateTime(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16)
}

export default function CompromissosForm({
  initialValue,
  administratorId,
  onSave,
  onCancel,
}: CompromissosFormProps) {
  const [title, setTitle] = useState(initialValue?.titulo ?? '')
  const [description, setDescription] = useState(initialValue?.descricao ?? '')
  const [start, setStart] = useState(toLocalDateTime(initialValue?.dataHoraInicio))
  const [end, setEnd] = useState(toLocalDateTime(initialValue?.dataHoraFim))
  const [categoryId, setCategoryId] = useState(
    initialValue?.idCategoria ? String(initialValue.idCategoria) : '',
  )
  const [clientId, setClientId] = useState(
    initialValue?.idCliente ? String(initialValue.idCliente) : '',
  )
  const [reminderMinutes, setReminderMinutes] = useState(
    initialValue?.antecedenciaAlertaMinutos === null
      ? ''
      : String(initialValue?.antecedenciaAlertaMinutos ?? 1440),
  )
  const [categories, setCategories] = useState<CategoriaCompromisso[]>([])
  const [clients, setClients] = useState<Cliente[]>([])
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([listCategorias(), listClientes()])
      .then(([categoryRows, clientRows]) => {
        if (!active) return
        setCategories(categoryRows)
        setClients(clientRows)
      })
      .catch((loadFailure: unknown) => {
        if (active) setLoadError(getErrorMessage(loadFailure))
      })
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await onSave({
        titulo: title.trim(),
        descricao: description.trim() || null,
        dataHoraInicio: new Date(start).toISOString(),
        dataHoraFim: end ? new Date(end).toISOString() : null,
        antecedenciaAlertaMinutos:
          reminderMinutes === '' ? null : Number(reminderMinutes),
        idCategoria: categoryId ? Number(categoryId) : null,
        idCliente: clientId ? Number(clientId) : null,
        ...(!initialValue && { idAdministrador: administratorId }),
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
          <span className="eyebrow">Planejamento</span>
          <h2>{initialValue ? 'Editar compromisso' : 'Novo compromisso'}</h2>
        </div>
        <button className="text-button" onClick={onCancel} type="button">Voltar à agenda</button>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field-wide">
            Título
            <input maxLength={150} onChange={(event) => setTitle(event.target.value)} required value={title} />
          </label>
          <label>
            Início
            <input onChange={(event) => setStart(event.target.value)} required type="datetime-local" value={start} />
          </label>
          <label>
            Término <span className="optional-label">opcional</span>
            <input min={start || undefined} onChange={(event) => setEnd(event.target.value)} type="datetime-local" value={end} />
          </label>
          <label>
            Categoria <span className="optional-label">opcional</span>
            <select onChange={(event) => setCategoryId(event.target.value)} value={categoryId}>
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.idCategoria} value={category.idCategoria}>{category.nomeCategoria}</option>
              ))}
            </select>
          </label>
          <label>
            Cliente <span className="optional-label">opcional</span>
            <select onChange={(event) => setClientId(event.target.value)} value={clientId}>
              <option value="">Sem cliente vinculado</option>
              {clients.map((client) => (
                <option key={client.idCliente} value={client.idCliente}>{client.razaoSocialNome}</option>
              ))}
            </select>
          </label>
          <label>
            Lembrete com antecedência
            <span className="input-suffix">
              <input
                min={0}
                onChange={(event) => setReminderMinutes(event.target.value)}
                placeholder="Sem lembrete"
                type="number"
                value={reminderMinutes}
              />
              <span>min</span>
            </span>
          </label>
          <label className="field-wide">
            Descrição <span className="optional-label">opcional</span>
            <textarea maxLength={4000} onChange={(event) => setDescription(event.target.value)} rows={4} value={description} />
          </label>
        </div>
        {loadError && <p className="form-error" role="alert">Não foi possível carregar clientes e categorias: {loadError}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="button button-outline" onClick={onCancel} type="button">Cancelar</button>
          <button className="button button-dark" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Salvando…' : 'Salvar compromisso'}
          </button>
        </div>
      </form>
    </section>
  )
}