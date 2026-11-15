import { useEffect, useState } from 'react'
import { deleteCategoria, listCategorias } from '../data/categoriasCompromisso'
import { getErrorMessage } from '../services/api'
import type { CategoriaCompromisso } from '../types/CategoriaCompromisso'

interface CategoriasListProps {
  refreshToken: number
  onCreate: () => void
  onEdit: (categoria: CategoriaCompromisso) => void
}

export default function CategoriasList({
  refreshToken,
  onCreate,
  onEdit,
}: CategoriasListProps) {
  const [categorias, setCategorias] = useState<CategoriaCompromisso[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    listCategorias()
      .then((rows) => {
        if (active) setCategorias(rows)
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [refreshToken])

  async function handleDelete(categoria: CategoriaCompromisso) {
    if (!window.confirm(`Remover a categoria "${categoria.nomeCategoria}"?`)) return
    setDeletingId(categoria.idCategoria)
    setError('')
    try {
      await deleteCategoria(categoria.idCategoria)
      setCategorias((current) => current.filter((item) => item.idCategoria !== categoria.idCategoria))
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="list-panel">
      <div className="list-toolbar">
        <div>
          <span className="eyebrow">Organização</span>
          <h2>Categorias de compromisso</h2>
        </div>
        <button className="button button-dark" onClick={onCreate} type="button">+ Nova categoria</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {isLoading ? (
        <div className="empty-state">Carregando categorias…</div>
      ) : categorias.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◌</span>
          <h3>Crie categorias do seu jeito.</h3>
          <p>Elas ajudam a reconhecer cada tipo de compromisso na agenda.</p>
        </div>
      ) : (
        <div className="category-grid">
          {categorias.map((categoria) => (
            <article className="category-card" key={categoria.idCategoria}>
              <span className="category-swatch" style={{ backgroundColor: categoria.corHex }} />
              <div className="category-info">
                <h3>{categoria.nomeCategoria}</h3>
                <code>{categoria.corHex.toUpperCase()}</code>
              </div>
              <div className="row-actions">
                <button className="text-button" onClick={() => onEdit(categoria)} type="button">Editar</button>
                <button
                  className="text-button danger-text"
                  disabled={deletingId === categoria.idCategoria}
                  onClick={() => void handleDelete(categoria)}
                  type="button"
                >
                  {deletingId === categoria.idCategoria ? 'Removendo…' : 'Remover'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}