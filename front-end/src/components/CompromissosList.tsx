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
  ArrowLeftIcon,
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

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
})

const dayNumberFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
})

const weekRangeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
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

function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  start.setDate(start.getDate() - start.getDay())
  return start
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
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
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list')
  const [showOnlyPending, setShowOnlyPending] = useState(false)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [todayKey] = useState(() => dateKey(new Date()))
  const visibleCompromissos = showOnlyPending
    ? compromissos.filter((compromisso) => !compromisso.concluido)
    : compromissos

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    return date
  })
  const commitmentsByDay = new Map(
    weekDays.map((date) => [dateKey(date), [] as Compromisso[]]),
  )

  for (const compromisso of visibleCompromissos) {
    const start = new Date(compromisso.dataHoraInicio)
    if (Number.isNaN(start.getTime())) continue
    commitmentsByDay.get(dateKey(start))?.push(compromisso)
  }

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

        <div className="auctus-agenda-toolbar">
          <div
            aria-label="Forma de exibição"
            className="auctus-view-switch"
            role="group"
          >
            <button
              aria-pressed={viewMode === 'list'}
              className={viewMode === 'list' ? 'is-selected' : ''}
              onClick={() => setViewMode('list')}
              type="button"
            >
              Lista
            </button>
            <button
              aria-pressed={viewMode === 'week'}
              className={viewMode === 'week' ? 'is-selected' : ''}
              onClick={() => setViewMode('week')}
              type="button"
            >
              Agenda semanal
            </button>
          </div>

          {viewMode === 'week' && (
            <div aria-label="Navegar pela semana" className="auctus-week-nav">
              <button
                aria-label="Semana anterior"
                className="auctus-btn-icon"
                onClick={() =>
                  setWeekStart((current) => {
                    const previous = new Date(current)
                    previous.setDate(previous.getDate() - 7)
                    return previous
                  })
                }
                type="button"
              >
                <ArrowLeftIcon />
              </button>
              <strong>
                {weekRangeFormatter.format(weekDays[0])} -{' '}
                {weekRangeFormatter.format(weekDays[6])}
              </strong>
              <button
                aria-label="Próxima semana"
                className="auctus-btn-icon"
                onClick={() =>
                  setWeekStart((current) => {
                    const next = new Date(current)
                    next.setDate(next.getDate() + 7)
                    return next
                  })
                }
                type="button"
              >
                <ArrowLeftIcon className="is-flipped" />
              </button>
              <button
                className="auctus-btn-secondary auctus-week-today"
                onClick={() => setWeekStart(startOfWeek(new Date()))}
                type="button"
              >
                Hoje
              </button>
            </div>
          )}
        </div>

        <label className="auctus-pending-filter">
          <input
            checked={showOnlyPending}
            onChange={(event) => setShowOnlyPending(event.target.checked)}
            type="checkbox"
          />
          <span>Mostrar somente pendentes</span>
        </label>

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
        ) : visibleCompromissos.length === 0 ? (
          <div className="auctus-empty">
            <h3>Nenhum compromisso pendente.</h3>
            <p>Desmarque o filtro para ver todos os compromissos.</p>
          </div>
        ) : viewMode === 'week' ? (
          <div
            aria-label="Compromissos da semana"
            className="auctus-week-calendar"
          >
            <div className="auctus-week-grid">
              {weekDays.map((date) => {
                const dayCommitments = commitmentsByDay.get(dateKey(date)) ?? []
                dayCommitments.sort(
                  (first, second) =>
                    new Date(first.dataHoraInicio).getTime() -
                    new Date(second.dataHoraInicio).getTime(),
                )
                const isToday = dateKey(date) === todayKey

                return (
                  <section
                    aria-label={date.toLocaleDateString('pt-BR')}
                    className={`auctus-week-day${isToday ? ' is-today' : ''}`}
                    key={dateKey(date)}
                  >
                    <header className="auctus-week-day-header">
                      <span>{weekdayFormatter.format(date).replace('.', '')}</span>
                      <strong>{dayNumberFormatter.format(date)}</strong>
                    </header>
                    <div className="auctus-week-events">
                      {dayCommitments.length === 0 ? (
                        <span className="auctus-week-no-events">
                          Sem compromissos
                        </span>
                      ) : (
                        dayCommitments.map((compromisso) => (
                          <article
                            className={`auctus-week-event${compromisso.concluido ? ' is-done' : ''}`}
                            key={compromisso.idCompromisso}
                          >
                            <span
                              aria-hidden="true"
                              className="auctus-week-event-accent"
                              style={{
                                backgroundColor:
                                  compromisso.categoria?.corHex ?? '#b7c8b8',
                              }}
                            />
                            <div className="auctus-week-event-content">
                              <strong className="auctus-week-event-time">
                                {formatTime(compromisso.dataHoraInicio)}
                                {compromisso.dataHoraFim &&
                                  ` – ${formatTime(compromisso.dataHoraFim)}`}
                              </strong>
                              <h3>{compromisso.titulo}</h3>
                              {compromisso.categoria && (
                                <span className="auctus-week-event-category">
                                  {compromisso.categoria.nomeCategoria}
                                </span>
                              )}
                              <div className="auctus-week-event-actions">
                                <TarefasChecklist
                                  checked={compromisso.concluido}
                                  onToggle={() =>
                                    void toggleCompleted(compromisso)
                                  }
                                />
                                <button
                                  aria-label={`Editar ${compromisso.titulo}`}
                                  className="auctus-btn-icon"
                                  onClick={() => onEdit(compromisso)}
                                  title="Editar"
                                  type="button"
                                >
                                  <EditIcon />
                                </button>
                              </div>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="auctus-agenda-list">
            {visibleCompromissos.map((compromisso) => {
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
