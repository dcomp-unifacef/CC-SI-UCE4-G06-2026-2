import { useEffect, useState } from 'react'
import {
  deleteCompromisso,
  listCompromissos,
  toggleCompromissoConcluido,
} from '../data/compromissos'
import { getErrorMessage } from '../services/api'
import type { Compromisso } from '../types/Compromisso'
import {
  AlertTriangleIcon,
  CalendarIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
} from './admin/AdminIcons'
import TarefasChecklist from './TarefasChecklist'
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

interface CompromissosListProps {
  refreshToken: number
  onCreate: () => void
  onEdit: (compromisso: Compromisso) => void
  onChanged: () => void
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Data inválida'
    : dateFormatter.format(date)
}

function formatTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '--:--' : timeFormatter.format(date)
}

export default function CompromissosList({
  refreshToken,
  onCreate,
  onEdit,
  onChanged,
}: CompromissosListProps) {
  const [compromissos, setCompromissos] = useState<Compromisso[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    listCompromissos()
      .then((rows) => {
        if (active) setCompromissos(rows)
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

  async function toggleCompleted(compromisso: Compromisso) {
    setBusyId(compromisso.idCompromisso)
    setError('')
    try {
      await toggleCompromissoConcluido(compromisso.idCompromisso)
      onChanged()
    } catch (toggleError) {
      setError(getErrorMessage(toggleError))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(compromisso: Compromisso) {
    setBusyId(compromisso.idCompromisso)
    setError('')
    try {
      await deleteCompromisso(compromisso.idCompromisso)
      setCompromissos((current) =>
        current.filter(
          (item) => item.idCompromisso !== compromisso.idCompromisso,
        ),
      )
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section>
      <div className="auctus-page-header">
        <div>
          <span className="auctus-page-kicker">Sua rotina</span>
          <h1 className="auctus-page-title">Agenda de compromissos</h1>
          <p className="auctus-page-subtitle">
            Organize atendimentos, provas e prazos em um só lugar.
          </p>
        </div>
        <button
          className="auctus-btn-primary"
          onClick={onCreate}
          type="button"
        >
          <PlusIcon />
          <span>Novo compromisso</span>
        </button>
      </div>

      <div className="auctus-surface">
        {error && (
          <p className="alert alert-danger py-2 px-3 mb-3" role="alert">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="auctus-empty">Carregando agenda…</div>
        ) : compromissos.length === 0 ? (
          <div className="auctus-empty">
            <span className="auctus-empty-icon">
              <CalendarIcon />
            </span>
            <h3>Um espaço em branco para começar.</h3>
            <p>
              Adicione seu primeiro compromisso para organizar os próximos
              passos.
            </p>
          </div>
        ) : (
          <div className="auctus-agenda-list">
            {compromissos.map((compromisso) => {
              const isBusy = busyId === compromisso.idCompromisso

              return (
                <article
                  className={`auctus-agenda-card${compromisso.concluido ? ' is-done' : ''}`}
                  key={compromisso.idCompromisso}
                >
                  <div className="auctus-agenda-date">
                    <span className="auctus-agenda-day">
                      {formatDate(compromisso.dataHoraInicio)}
                    </span>
                    <strong className="auctus-agenda-time">
                      {formatTime(compromisso.dataHoraInicio)}
                    </strong>
                    {compromisso.dataHoraFim && (
                      <span className="auctus-agenda-end">
                        até {formatTime(compromisso.dataHoraFim)}
                      </span>
                    )}
                  </div>

                  <div
                    aria-hidden="true"
                    className="auctus-agenda-accent"
                    style={{
                      backgroundColor:
                        compromisso.categoria?.corHex ?? '#b7c8b8',
                    }}
                  />

                  <div className="auctus-agenda-body">
                    <h2 className="auctus-agenda-title">
                      {compromisso.titulo}
                    </h2>
                    <div className="auctus-agenda-meta">
                      <span>
                        {compromisso.cliente?.razaoSocialNome ??
                          'Sem cliente vinculado'}
                      </span>
                      {compromisso.categoria && (
                        <span className="auctus-pill">
                          {compromisso.categoria.nomeCategoria}
                        </span>
                      )}
                    </div>
                    {compromisso.descricao && (
                      <p className="auctus-agenda-desc">
                        {compromisso.descricao}
                      </p>
                    )}
                  </div>

                  <div className="auctus-agenda-actions">
                    <span className="task-control">
                      <TarefasChecklist
                        checked={compromisso.concluido}
                        onToggle={() => void toggleCompleted(compromisso)}
                      />
                      <small>
                        {compromisso.concluido ? 'Concluído' : 'Pendente'}
                      </small>
                    </span>

                    <button
                      aria-label={`Editar ${compromisso.titulo}`}
                      className="auctus-btn-icon"
                      onClick={() => onEdit(compromisso)}
                      title="Editar"
                      type="button"
                    >
                      <EditIcon />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <button
                            aria-label={`Remover ${compromisso.titulo}`}
                            className="auctus-btn-icon is-danger"
                            disabled={isBusy}
                            title="Remover"
                            type="button"
                          />
                        }
                      >
                        <TrashIcon />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogMedia>
                            <AlertTriangleIcon />
                          </AlertDialogMedia>
                          <AlertDialogTitle>
                            Excluir compromisso?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O compromisso{' '}
                            <strong>"{compromisso.titulo}"</strong> será
                            removido permanentemente da sua agenda.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void handleDelete(compromisso)}
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
