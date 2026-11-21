import { useEffect, useState, type FormEvent } from 'react'
import { listClientes } from '../data/clientes'
import { getErrorMessage } from '../services/api'
import type { Cliente } from '../types/Cliente'
import { DownloadIcon, UsersIcon } from './admin/AdminIcons'
import { downloadCsv } from '../utils/csv'

interface Period {
  from: string
  to: string
}

interface RelatoriosListProps {
  refreshToken: number
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function toDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function getDefaultPeriod(): Period {
  const today = new Date()
  return {
    from: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toDateInputValue(today),
  }
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? '—' : dateFormatter.format(timestamp)
}

function formatPeriod(period: Period): string {
  return `${formatDate(`${period.from}T00:00:00`)} - ${formatDate(`${period.to}T00:00:00`)}`
}

export default function RelatoriosList({
  refreshToken,
}: RelatoriosListProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState(getDefaultPeriod)
  const [appliedPeriod, setAppliedPeriod] = useState(period)
  const [periodError, setPeriodError] = useState('')

  useEffect(() => {
    let active = true

    listClientes()
      .then((rows) => {
        if (!active) return
        setClientes(rows)
        setError('')
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

  const startTimestamp = Date.parse(`${appliedPeriod.from}T00:00:00`)
  const endTimestamp = Date.parse(`${appliedPeriod.to}T23:59:59.999`)
  const reportClients = clientes
    .filter((cliente) => {
      const createdAt = Date.parse(cliente.criadoEm)
      return (
        !Number.isNaN(createdAt) &&
        createdAt >= startTimestamp &&
        createdAt <= endTimestamp
      )
    })
    .sort(
      (first, second) =>
        Date.parse(second.criadoEm) - Date.parse(first.criadoEm),
    )

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPeriodError('')

    if (!period.from || !period.to) {
      setPeriodError('Informe as datas inicial e final do período.')
      return
    }

    if (period.from > period.to) {
      setPeriodError('A data inicial deve ser anterior ou igual à data final.')
      return
    }

    setAppliedPeriod(period)
  }

  function handleExport() {
    setError('')
    try {
      const rows: (string | number)[][] = [
        ['Relatório', 'Novos contatos'],
        ['Período', formatPeriod(appliedPeriod)],
        ['Total de novos contatos', reportClients.length],
        [],
        [
          'ID',
          'Nome / razão social',
          'CPF / CNPJ',
          'Telefone / WhatsApp',
          'E-mail',
          'Ramo de atuação',
          'Origem do contato',
          'Observações',
          'Data de cadastro',
        ],
        ...reportClients.map((cliente) => [
          cliente.idCliente,
          cliente.razaoSocialNome,
          cliente.cnpjCpf ?? '',
          cliente.telefoneWhatsapp,
          cliente.email ?? '',
          cliente.ramoAtuacao ?? '',
          cliente.origemContato,
          cliente.observacoes ?? '',
          formatDate(cliente.criadoEm),
        ]),
      ]

      downloadCsv(
        `relatorio-novos-contatos_${appliedPeriod.from}_${appliedPeriod.to}.csv`,
        rows,
      )
    } catch (exportError: unknown) {
      setError(getErrorMessage(exportError))
    }
  }

  return (
    <section>
      <div className="auctus-page-header">
        <div>
          <span className="auctus-page-kicker">Captação</span>
          <h1 className="auctus-page-title">Relatório de novos contatos</h1>
          <p className="auctus-page-subtitle">
            Consulte os contatos cadastrados em um período e exporte os
            resultados.
          </p>
        </div>
      </div>

      <div className="auctus-surface">
        {error && (
          <p className="alert alert-danger py-2 px-3 mb-3" role="alert">
            {error}
          </p>
        )}

        <form className="auctus-report-filters" onSubmit={handleGenerate}>
          <div className="auctus-report-field">
            <label className="form-label" htmlFor="relatorio-data-inicial">
              Data inicial
            </label>
            <input
              className="form-control"
              id="relatorio-data-inicial"
              onChange={(event) =>
                setPeriod((current) => ({
                  ...current,
                  from: event.target.value,
                }))
              }
              required
              type="date"
              value={period.from}
            />
          </div>
          <div className="auctus-report-field">
            <label className="form-label" htmlFor="relatorio-data-final">
              Data final
            </label>
            <input
              className="form-control"
              id="relatorio-data-final"
              onChange={(event) =>
                setPeriod((current) => ({
                  ...current,
                  to: event.target.value,
                }))
              }
              required
              type="date"
              value={period.to}
            />
          </div>
          <button
            className="auctus-btn-primary"
            disabled={isLoading}
            type="submit"
          >
            Gerar relatório
          </button>
        </form>

        {periodError && (
          <p className="alert alert-danger py-2 px-3 mt-3 mb-0" role="alert">
            {periodError}
          </p>
        )}

        <div aria-live="polite" className="auctus-report-summary">
          <div>
            <span className="auctus-report-label">Novos contatos</span>
            <strong className="auctus-report-total">
              {isLoading ? '…' : reportClients.length}
            </strong>
            <span className="auctus-report-period">
              Período: {formatPeriod(appliedPeriod)}
            </span>
          </div>
          <button
            className="auctus-btn-secondary"
            disabled={isLoading || Boolean(error)}
            onClick={handleExport}
            type="button"
          >
            <DownloadIcon />
            <span>Exportar para Excel</span>
          </button>
        </div>

        {isLoading ? (
          <div className="auctus-empty">Carregando contatos…</div>
        ) : reportClients.length === 0 ? (
          <div className="auctus-empty">
            <span className="auctus-empty-icon">
              <UsersIcon />
            </span>
            <h3>Nenhum contato neste período.</h3>
            <p>Altere o intervalo para consultar outros cadastros.</p>
          </div>
        ) : (
          <>
            <div className="auctus-table-wrap">
              <table className="auctus-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Contato</th>
                    <th>Origem</th>
                    <th>Data do cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {reportClients.map((cliente) => (
                    <tr key={cliente.idCliente}>
                      <td>
                        <span className="auctus-cell-main">
                          {cliente.razaoSocialNome}
                        </span>
                      </td>
                      <td>
                        <span>{cliente.telefoneWhatsapp}</span>
                        {cliente.email && (
                          <span className="auctus-cell-sub">
                            {cliente.email}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="auctus-pill">
                          {cliente.origemContato}
                        </span>
                      </td>
                      <td>{formatDate(cliente.criadoEm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="auctus-mobile-cards">
              {reportClients.map((cliente) => (
                <article
                  className="auctus-client-mobile-card"
                  key={cliente.idCliente}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <span className="auctus-cell-main">
                      {cliente.razaoSocialNome}
                    </span>
                    <span className="auctus-pill">{cliente.origemContato}</span>
                  </div>
                  <div className="small text-secondary">
                    <div>{cliente.telefoneWhatsapp}</div>
                    {cliente.email && <div>{cliente.email}</div>}
                    <div>Cadastro: {formatDate(cliente.criadoEm)}</div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
