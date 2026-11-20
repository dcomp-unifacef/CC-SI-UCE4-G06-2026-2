import { useState, type FormEvent } from 'react'
import { getErrorMessage } from '../services/api'
import type {
  CategoriaCompromisso,
  CategoriaCompromissoInput,
} from '../types/CategoriaCompromisso'
import { ArrowLeftIcon } from './admin/AdminIcons'
import { ColorPicker } from './ui/color-picker'

interface CategoriasFormProps {
  initialValue: CategoriaCompromisso | null
  onSave: (input: CategoriaCompromissoInput) => Promise<void>
  onCancel: () => void
}

export default function CategoriasForm({
  initialValue,
  onSave,
  onCancel,
}: CategoriasFormProps) {
  const [name, setName] = useState(initialValue?.nomeCategoria ?? '')
  const [color, setColor] = useState(initialValue?.corHex ?? '#78937d')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await onSave({ nomeCategoria: name.trim(), corHex: color })
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
          <span className="auctus-page-kicker">Organização da agenda</span>
          <h2>{initialValue ? 'Editar categoria' : 'Nova categoria'}</h2>
        </div>
        <button className="auctus-btn-link" onClick={onCancel} type="button">
          <ArrowLeftIcon />
          <span>Voltar à lista</span>
        </button>
      </div>

      <form className="auctus-form" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-8">
            <label className="form-label" htmlFor="categoria-nome">
              Nome da categoria
            </label>
            <input
              className="form-control"
              id="categoria-nome"
              maxLength={50}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Ajustes, Sob medida, Provas"
              required
              value={name}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="categoria-cor">
              Cor de identificação
            </label>
            <ColorPicker
              id="categoria-cor"
              onChange={setColor}
              value={color}
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
            {isSubmitting ? 'Salvando…' : 'Salvar categoria'}
          </button>
        </div>
      </form>
    </section>
  )
}
