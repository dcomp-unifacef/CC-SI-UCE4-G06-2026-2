import { useEffect, useState } from 'react'
import {
  deleteCompromisso,
  listCompromissos,
  toggleCompromissoConcluido,
} from '../data/compromissos'
import { getErrorMessage } from '../services/api'
import type { Compromisso } from '../types/Compromisso'
import TarefasChecklist from './TarefasChecklist'

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
  return Number.isNaN(date.getTime()) ? 'Data inválida' : dateFormatter.format(date)
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
    if (!window.confirm(`Remover o compromisso "${compromisso.titulo}"?`)) return
    setBusyId(compromisso.idCompromisso)
    setError('')
    try {
      await deleteCompromisso(compromisso.idCompromisso)
      setCompromissos((current) => current.filter((item) => item.idCompromisso !== compromisso.idCompromisso))
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="list-panel">
      <div className="list-toolbar">
        <div>
          <span className="eyebrow">Sua rotina</span>
          <h2>Agenda de compromissos</h2>
        </div>
        <button className="button button-dark" onClick={onCreate} type="button">+ Novo compromisso</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {isLoading ? (
        <div className="empty-state">Carregando agenda…</div>
      ) : compromissos.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">▦</span>
          <h3>Um espaço em branco para começar.</h3>
          <p>Adicione seu primeiro compromisso para organizar os próximos passos.</p>
        </div>
      ) : (
        <div className="appointment-list">
          {compromissos.map((compromisso) => (
            <article
              className={`appointment-card${compromisso.concluido ? ' appointment-done' : ''}`}
              key={compromisso.idCompromisso}
            >
              <div className="appointment-date">
                <span>{formatDate(compromisso.dataHoraInicio)}</span>
                <b>{formatTime(compromisso.dataHoraInicio)}</b>
                {compromisso.dataHoraFim && <small>até {formatTime(compromisso.dataHoraFim)}</small>}
              </div>
              <div className="appointment-mark" style={{ backgroundColor: compromisso.categoria?.corHex ?? '#b7c8b8' }} />
              <div className="appointment-content">
                <h3>{compromisso.titulo}</h3>
                <p>
                  {compromisso.cliente?.razaoSocialNome ?? 'Sem cliente vinculado'}
                  {compromisso.categoria && <span className="appointment-category">{compromisso.categoria.nomeCategoria}</span>}
                </p>
                {compromisso.descricao && <small className="appointment-description">{compromisso.descricao}</small>}
              </div>
              <div className="appointment-actions">
                <span className="task-control">
                  <TarefasChecklist
                    checked={compromisso.concluido}
                    onToggle={() => void toggleCompleted(compromisso)}
                  />
                  <small>{compromisso.concluido ? 'Concluído' : 'Pendente'}</small>
                </span>
                <button
                  aria-label={`Editar ${compromisso.titulo}`}
                  className="icon-button"
                  onClick={() => onEdit(compromisso)}
                  type="button"
                >✎</button>
                <button
                  aria-label={`Remover ${compromisso.titulo}`}
                  className="icon-button danger-text"
                  disabled={busyId === compromisso.idCompromisso}
                  onClick={() => void handleDelete(compromisso)}
                  type="button"
                >×</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}