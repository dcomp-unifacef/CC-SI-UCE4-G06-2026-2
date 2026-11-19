import { useEffect, useState } from 'react'
import { deleteCategoria, listCategorias } from '../data/categoriasCompromisso'
import { getErrorMessage } from '../services/api'
import type { CategoriaCompromisso } from '../types/CategoriaCompromisso'
import { AlertTriangleIcon, PlusIcon, TagIcon } from './admin/AdminIcons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'

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
    setDeletingId(categoria.idCategoria)
    setError('')
    try {
      await deleteCategoria(categoria.idCategoria)
      setCategorias((current) =>
        current.filter((item) => item.idCategoria !== categoria.idCategoria),
      )
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section>
      <div className="auctus-page-header">
        <div>
          <span className="auctus-page-kicker">Organização</span>
          <h1 className="auctus-page-title">Categorias de compromisso</h1>
          <p className="auctus-page-subtitle">
            Organize seus compromissos por tipo e identifique tudo com
            facilidade.
          </p>
        </div>
        <button
          className="auctus-btn-primary"
          onClick={onCreate}
          type="button"
        >
          <PlusIcon />
          <span>Nova categoria</span>
        </button>
      </div>

      <div className="auctus-surface">
        {error && (
          <p className="alert alert-danger py-2 px-3 mb-3" role="alert">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="auctus-empty">Carregando categorias…</div>
        ) : categorias.length === 0 ? (
          <div className="auctus-empty">
            <span className="auctus-empty-icon">
              <TagIcon />
            </span>
            <h3>Crie categorias do seu jeito.</h3>
            <p>Elas ajudam a reconhecer cada tipo de compromisso na agenda.</p>
          </div>
        ) : (
          <div className="auctus-category-grid">
            {categorias.map((categoria) => {
              const isDeleting = deletingId === categoria.idCategoria

              return (
                <article
                  className="auctus-category-card"
                  key={categoria.idCategoria}
                >
                  <span
                    aria-hidden="true"
                    className="auctus-category-swatch"
                    style={{ backgroundColor: categoria.corHex }}
                  />
                  <div className="auctus-category-info">
                    <h3>{categoria.nomeCategoria}</h3>
                    <code>{categoria.corHex.toUpperCase()}</code>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <button
                      className="auctus-btn-link"
                      onClick={() => onEdit(categoria)}
                      type="button"
                    >
                      Editar
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <button
                            className="auctus-btn-link is-danger"
                            disabled={isDeleting}
                            type="button"
                          />
                        }
                      >
                        {isDeleting ? '…' : 'Remover'}
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogMedia>
                            <AlertTriangleIcon />
                          </AlertDialogMedia>
                          <AlertDialogTitle>
                            Excluir categoria?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A categoria{' '}
                            <strong>"{categoria.nomeCategoria}"</strong> será
                            removida permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void handleDelete(categoria)}
                            variant="destructive"
                          >
                            Confirmar exclusão
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
