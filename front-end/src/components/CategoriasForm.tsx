import { useState, type FormEvent } from 'react'
import type {
  CategoriaCompromisso,
  CategoriaCompromissoInput,
} from '../types/CategoriaCompromisso'
import { getErrorMessage } from '../services/api'

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
    <section className="editor-panel">
      <div className="editor-heading">
        <div>
          <span className="eyebrow">Organização da agenda</span>
          <h2>{initialValue ? 'Editar categoria' : 'Nova categoria'}</h2>
        </div>
        <button className="text-button" onClick={onCancel} type="button">Voltar à lista</button>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field-wide">
            Nome da categoria
            <input maxLength={50} onChange={(event) => setName(event.target.value)} required value={name} />
          </label>
          <label>
            Cor de identificação
            <span className="color-control">
              <input aria-label="Cor da categoria" onChange={(event) => setColor(event.target.value)} type="color" value={color} />
              <code>{color.toUpperCase()}</code>
            </span>
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="button button-outline" onClick={onCancel} type="button">Cancelar</button>
          <button className="button button-dark" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Salvando…' : 'Salvar categoria'}
          </button>
        </div>
      </form>
    </section>
  )
}