import { useEffect, useState } from 'react'
import { deleteCliente, listClientes } from '../data/clientes'
import { getErrorMessage } from '../services/api'
import type { Cliente } from '../types/Cliente'
import { downloadCsv } from '../utils/csv'
import {
  AlertTriangleIcon,
  DownloadIcon,
  PlusIcon,
  UsersIcon,
} from './admin/AdminIcons'
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

interface ClientesListProps {
  refreshToken: number
  onCreate: () => void
  onEdit: (cliente: Cliente) => void
}

export default function ClientesList({
  refreshToken,
  onCreate,
  onEdit,
}: ClientesListProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    listClientes()
      .then((rows) => {
        if (active) setClientes(rows)
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

  async function handleDelete(cliente: Cliente) {
    setDeletingId(cliente.idCliente)
    setError('')
    try {
      await deleteCliente(cliente.idCliente)
      setClientes((current) =>
        current.filter((item) => item.idCliente !== cliente.idCliente),
      )
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setDeletingId(null)
    }
  }

  function handleExport() {
    setError('')
    try {
      const columns = [
        'ID',
        'Nome / razão social',
        'CPF / CNPJ',
        'Telefone / WhatsApp',
        'E-mail',
        'Ramo de atuação',
        'Origem do contato',
        'Observações',
        'Data de cadastro',
      ]
      const rows: (string | number)[][] = [
        columns,
        ...clientes.map((cliente) => [
          cliente.idCliente,
          cliente.razaoSocialNome,
          cliente.cnpjCpf ?? '',
          cliente.telefoneWhatsapp,
          cliente.email ?? '',
          cliente.ramoAtuacao ?? '',
          cliente.origemContato,
          cliente.observacoes ?? '',
          new Date(cliente.criadoEm).toLocaleDateString('pt-BR'),
        ]),
      ]
      downloadCsv('clientes.csv', rows)
    } catch (exportError: unknown) {
      setError(getErrorMessage(exportError))
    }
  }

  return (
    <section>
      <div className="auctus-page-header">
        <div>
          <span className="auctus-page-kicker">Relacionamentos</span>
          <h1 className="auctus-page-title">Seus clientes</h1>
          <p className="auctus-page-subtitle">
            Acompanhe as pessoas e os negócios que fazem parte da sua jornada.
          </p>
        </div>
        <button
          className="auctus-btn-primary"
          onClick={onCreate}
          type="button"
        >
          <PlusIcon />
          <span>Novo cliente</span>
        </button>
      </div>

      <div className="auctus-surface">
        {error && (
          <p className="alert alert-danger py-2 px-3 mb-3" role="alert">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="auctus-empty">Carregando clientes…</div>
        ) : clientes.length === 0 ? (
          <div className="auctus-empty">
            <span className="auctus-empty-icon">
              <UsersIcon />
            </span>
            <h3>Seu próximo relacionamento começa aqui.</h3>
            <p>
              Adicione um cliente ou aguarde novos contatos pelo formulário do
              site.
            </p>
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
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => {
                    const isDeleting = deletingId === cliente.idCliente

                    return (
                      <tr key={cliente.idCliente}>
                        <td>
                          <span className="auctus-cell-main">
                            {cliente.razaoSocialNome}
                          </span>
                          {cliente.ramoAtuacao && (
                            <span className="auctus-cell-sub">
                              {cliente.ramoAtuacao}
                            </span>
                          )}
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
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <button
                              className="auctus-btn-link"
                              onClick={() => onEdit(cliente)}
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
                                {isDeleting ? 'Removendo…' : 'Remover'}
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogMedia>
                                    <AlertTriangleIcon />
                                  </AlertDialogMedia>
                                  <AlertDialogTitle>
                                    Excluir cliente?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O cliente{' '}
                                    <strong>
                                      "{cliente.razaoSocialNome}"
                                    </strong>{' '}
                                    será removido permanentemente da sua base.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => void handleDelete(cliente)}
                                    variant="destructive"
                                  >
                                    Confirmar exclusão
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="auctus-mobile-cards">
              {clientes.map((cliente) => (
                <article
                  className="auctus-client-mobile-card"
                  key={cliente.idCliente}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <div>
                      <div className="auctus-cell-main">
                        {cliente.razaoSocialNome}
                      </div>
                      {cliente.ramoAtuacao && (
                        <div className="auctus-cell-sub">
                          {cliente.ramoAtuacao}
                        </div>
                      )}
                    </div>
                    <span className="auctus-pill">
                      {cliente.origemContato}
                    </span>
                  </div>
                  <div className="small text-secondary mb-3">
                    <div>{cliente.telefoneWhatsapp}</div>
                    {cliente.email && <div>{cliente.email}</div>}
                  </div>
                  <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    <button
                      className="auctus-btn-link"
                      onClick={() => onEdit(cliente)}
                      type="button"
                    >
                      Editar
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <button
                            className="auctus-btn-link is-danger"
                            disabled={deletingId === cliente.idCliente}
                            type="button"
                          />
                        }
                      >
                        {deletingId === cliente.idCliente
                          ? 'Removendo…'
                          : 'Remover'}
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogMedia>
                            <AlertTriangleIcon />
                          </AlertDialogMedia>
                          <AlertDialogTitle>
                            Excluir cliente?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O cliente{' '}
                            <strong>
                              "{cliente.razaoSocialNome}"
                            </strong>{' '}
                            será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void handleDelete(cliente)}
                            variant="destructive"
                          >
                            Confirmar exclusão
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </article>
              ))}
            </div>
            <div className="auctus-client-export">
              <button
                className="auctus-btn-secondary"
                onClick={handleExport}
                title="Baixar lista compatível com Excel (.csv)"
                type="button"
              >
                <DownloadIcon />
                <span>Exportar para Excel</span>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
