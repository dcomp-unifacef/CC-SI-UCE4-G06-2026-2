import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { listCategorias } from '../data/categoriasCompromisso'
import { listClientes } from '../data/clientes'
import { getErrorMessage } from '../services/api'
import type { CategoriaCompromisso } from '../types/CategoriaCompromisso'
import type { Cliente } from '../types/Cliente'
import type { Compromisso, CompromissoInput } from '../types/Compromisso'
import { ArrowLeftIcon } from './admin/AdminIcons'
import { DateTimePicker } from './ui/date-time-picker'
import { Select } from './ui/select'

const REMINDER_OPTIONS = [
  { value: '', label: 'Sem lembrete' },
  { value: '10', label: '10 minutos antes' },
  { value: '30', label: '30 minutos antes' },
  { value: '60', label: '1 hora antes (60 min)' },
  { value: '120', label: '2 horas antes' },
  { value: '1440', label: '1 dia antes (24h)' },
  { value: '2880', label: '2 dias antes' },
  { value: 'custom', label: 'Personalizado…' },
]

interface CompromissosFormProps {
  initialValue: Compromisso | null
  administratorId?: number
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
  const [start, setStart] = useState(
    toLocalDateTime(initialValue?.dataHoraInicio),
  )
  const [end, setEnd] = useState(toLocalDateTime(initialValue?.dataHoraFim))
  const [categoryId, setCategoryId] = useState(
    initialValue?.idCategoria ? String(initialValue.idCategoria) : '',
  )
  const [clientId, setClientId] = useState(
    initialValue?.idCliente ? String(initialValue.idCliente) : '',
  )
  const initialReminder =
    initialValue?.antecedenciaAlertaMinutos === null
      ? ''
      : String(initialValue?.antecedenciaAlertaMinutos ?? 1440)

  const [reminderMinutes, setReminderMinutes] = useState(initialReminder)
  const [reminderPreset, setReminderPreset] = useState(() => {
    if (initialReminder === '') return ''
    if (['10', '30', '60', '120', '1440', '2880'].includes(initialReminder)) {
      return initialReminder
    }
    return 'custom'
  })

  function handleReminderPresetChange(preset: string) {
    setReminderPreset(preset)
    if (preset !== 'custom') {
      setReminderMinutes(preset)
    }
  }
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

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Sem categoria' },
      ...categories.map((c) => ({
        value: String(c.idCategoria),
        label: c.nomeCategoria,
        color: c.corHex,
      })),
    ],
    [categories],
  )

  const clientOptions = useMemo(
    () => [
      { value: '', label: 'Sem cliente vinculado' },
      ...clients.map((c) => ({
        value: String(c.idCliente),
        label: c.razaoSocialNome,
      })),
    ],
    [clients],
  )

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
    <section className="auctus-surface">
      <div className="auctus-form-header">
        <div>
          <span className="auctus-page-kicker">Planejamento</span>
          <h2>
            {initialValue ? 'Editar compromisso' : 'Novo compromisso'}
          </h2>
        </div>
        <button className="auctus-btn-link" onClick={onCancel} type="button">
          <ArrowLeftIcon />
          <span>Voltar à agenda</span>
        </button>
      </div>

      <form className="auctus-form" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label" htmlFor="compromisso-titulo">
              Título
            </label>
            <input
              className="form-control"
              id="compromisso-titulo"
              maxLength={150}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Prova de vestido — Maria"
              required
              value={title}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="compromisso-inicio">
              Início
            </label>
            <DateTimePicker
              id="compromisso-inicio"
              onChange={setStart}
              placeholder="Selecionar data e horário"
              required
              value={start}
            />
          </div>

          <div className="col-12 col-md-6">
            <label
              className="form-label d-flex justify-content-between align-items-center"
              htmlFor="compromisso-termino"
            >
              <span>Término</span>
              <span className="auctus-optional">opcional</span>
            </label>
            <DateTimePicker
              id="compromisso-termino"
              min={start || undefined}
              onChange={setEnd}
              placeholder="Selecionar data e horário"
              value={end}
            />
          </div>

          <div className="col-12 col-md-4">
            <label
              className="form-label d-flex justify-content-between align-items-center"
              htmlFor="compromisso-categoria"
            >
              <span>Categoria</span>
              <span className="auctus-optional">opcional</span>
            </label>
            <Select
              id="compromisso-categoria"
              onValueChange={setCategoryId}
              options={categoryOptions}
              value={categoryId}
            />
          </div>

          <div className="col-12 col-md-4">
            <label
              className="form-label d-flex justify-content-between align-items-center"
              htmlFor="compromisso-cliente"
            >
              <span>Cliente</span>
              <span className="auctus-optional">opcional</span>
            </label>
            <Select
              id="compromisso-cliente"
              onValueChange={setClientId}
              options={clientOptions}
              value={clientId}
            />
          </div>

          <div className="col-12 col-md-4">
            <label
              className="form-label d-flex justify-content-between align-items-center"
              htmlFor="compromisso-lembrete"
            >
              <span>Lembrete</span>
              <span className="auctus-optional">antecedência</span>
            </label>
            <Select
              id="compromisso-lembrete"
              onValueChange={handleReminderPresetChange}
              options={REMINDER_OPTIONS}
              value={reminderPreset}
            />
            {reminderPreset === 'custom' && (
              <div className="mt-2">
                <input
                  aria-label="Minutos personalizados de antecedência"
                  className="form-control"
                  max={10080}
                  min={1}
                  onChange={(event) => setReminderMinutes(event.target.value)}
                  placeholder="Minutos antes (ex: 45)"
                  type="number"
                  value={reminderMinutes}
                />
              </div>
            )}
          </div>

          <div className="col-12">
            <label
              className="form-label d-flex justify-content-between align-items-center"
              htmlFor="compromisso-descricao"
            >
              <span>Descrição</span>
              <span className="auctus-optional">opcional</span>
            </label>
            <textarea
              className="form-control"
              id="compromisso-descricao"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Anotações sobre o atendimento ou detalhes importantes do compromisso"
              value={description}
            />
          </div>
        </div>

        {(loadError || error) && (
          <p className="alert alert-danger py-2 px-3 mt-3 mb-0" role="alert">
            {error || loadError}
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
            {isSubmitting ? 'Salvando…' : 'Salvar compromisso'}
          </button>
        </div>
      </form>
    </section>
  )
}
