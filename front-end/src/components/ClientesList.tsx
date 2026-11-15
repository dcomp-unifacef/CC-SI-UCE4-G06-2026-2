import { useEffect, useState } from 'react'
import { deleteCliente, listClientes } from '../data/clientes'
import { getErrorMessage } from '../services/api'
import type { Cliente } from '../types/Cliente'

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
    if (!window.confirm(`Remover o cadastro de "${cliente.razaoSocialNome}"?`)) return
    setDeletingId(cliente.idCliente)
    setError('')
    try {
      await deleteCliente(cliente.idCliente)
      setClientes((current) => current.filter((item) => item.idCliente !== cliente.idCliente))
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
          <span className="eyebrow">Relacionamentos</span>
          <h2>Seus clientes</h2>
        </div>
        <button className="button button-dark" onClick={onCreate} type="button">+ Novo cliente</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {isLoading ? (
        <div className="empty-state">Carregando clientes…</div>
      ) : clientes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◌</span>
          <h3>Seu próximo relacionamento começa aqui.</h3>
          <p>Adicione um cliente ou aguarde novos contatos pelo formulário do site.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nome</th><th>Contato</th><th>Origem</th><th className="actions-heading">Ações</th></tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.idCliente}>
                  <td>
                    <b>{cliente.razaoSocialNome}</b>
                    {cliente.ramoAtuacao && <small>{cliente.ramoAtuacao}</small>}
                  </td>
                  <td>
                    <span>{cliente.telefoneWhatsapp}</span>
                    {cliente.email && <small>{cliente.email}</small>}
                  </td>
                  <td><span className="origin-pill">{cliente.origemContato}</span></td>
                  <td className="row-actions">
                    <button className="text-button" onClick={() => onEdit(cliente)} type="button">Editar</button>
                    <button
                      className="text-button danger-text"
                      disabled={deletingId === cliente.idCliente}
                      onClick={() => void handleDelete(cliente)}
                      type="button"
                    >
                      {deletingId === cliente.idCliente ? 'Removendo…' : 'Remover'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}