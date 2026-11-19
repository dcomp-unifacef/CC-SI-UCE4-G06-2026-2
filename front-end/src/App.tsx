import { useEffect, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import './App.css'
import AdminLayout from './components/admin/AdminLayout'
import { EditRouteError, EditRouteLoading } from './components/admin/EditRouteState'
import CategoriasForm from './components/CategoriasForm'
import CategoriasList from './components/CategoriasList'
import ClientesForm from './components/ClientesForm'
import ClientesList from './components/ClientesList'
import CompromissosForm from './components/CompromissosForm'
import CompromissosList from './components/CompromissosList'
import Homepage from './components/Homepage'
import LoginForm from './components/LoginForm'
import {
  createCategoria,
  getCategoria,
  updateCategoria,
} from './data/categoriasCompromisso'
import { createCliente, getCliente, updateCliente } from './data/clientes'
import {
  createCompromisso,
  getCompromisso,
  updateCompromisso,
} from './data/compromissos'
import { apiRequest, getErrorMessage } from './services/api'
import type { Administrador } from './types/Administrador'
import type {
  CategoriaCompromisso,
  CategoriaCompromissoInput,
} from './types/CategoriaCompromisso'
import type { Cliente, ClienteInput } from './types/Cliente'
import type { Compromisso, CompromissoInput } from './types/Compromisso'

function getStoredAdministrator(): Administrador | null {
  try {
    const stored = sessionStorage.getItem('atelie-administrador')
    return stored ? (JSON.parse(stored) as Administrador) : null
  } catch {
    return null
  }
}

function CompromissoEditRoute({
  administratorId,
  onSave,
  onCancel,
}: {
  administratorId: number
  onSave: (id: number, input: CompromissoInput) => Promise<void>
  onCancel: () => void
}) {
  const { id } = useParams<{ id: string }>()
  const compromissoId = Number(id)
  const isInvalidId = Number.isNaN(compromissoId) || compromissoId <= 0
  const [compromisso, setCompromisso] = useState<Compromisso | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(!isInvalidId)

  useEffect(() => {
    if (isInvalidId) return

    let active = true
    getCompromisso(compromissoId)
      .then((data) => {
        if (active) setCompromisso(data)
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
  }, [compromissoId, isInvalidId])

  if (isInvalidId) {
    return (
      <EditRouteError
        backLabel="Voltar à agenda"
        kicker="Planejamento"
        message="Identificador de compromisso inválido."
        onBack={onCancel}
        title="Compromisso não encontrado"
      />
    )
  }

  if (isLoading) {
    return <EditRouteLoading message="Carregando compromisso…" />
  }

  if (error || !compromisso) {
    return (
      <EditRouteError
        backLabel="Voltar à agenda"
        kicker="Planejamento"
        message={error || 'Não foi possível carregar o compromisso solicitado.'}
        onBack={onCancel}
        title="Compromisso não encontrado"
      />
    )
  }

  return (
    <CompromissosForm
      administratorId={administratorId}
      initialValue={compromisso}
      onCancel={onCancel}
      onSave={(input) => onSave(compromissoId, input)}
    />
  )
}

function ClienteEditRoute({
  onSave,
  onCancel,
}: {
  onSave: (id: number, input: ClienteInput) => Promise<void>
  onCancel: () => void
}) {
  const { id } = useParams<{ id: string }>()
  const clienteId = Number(id)
  const isInvalidId = Number.isNaN(clienteId) || clienteId <= 0
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(!isInvalidId)

  useEffect(() => {
    if (isInvalidId) return

    let active = true
    getCliente(clienteId)
      .then((data) => {
        if (active) setCliente(data)
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
  }, [clienteId, isInvalidId])

  if (isInvalidId) {
    return (
      <EditRouteError
        backLabel="Voltar à lista"
        kicker="Relacionamentos"
        message="Identificador de cliente inválido."
        onBack={onCancel}
        title="Cliente não encontrado"
      />
    )
  }

  if (isLoading) {
    return <EditRouteLoading message="Carregando cliente…" />
  }

  if (error || !cliente) {
    return (
      <EditRouteError
        backLabel="Voltar à lista"
        kicker="Relacionamentos"
        message={error || 'Não foi possível carregar o cliente solicitado.'}
        onBack={onCancel}
        title="Cliente não encontrado"
      />
    )
  }

  return (
    <ClientesForm
      initialValue={cliente}
      onCancel={onCancel}
      onSave={(input) => onSave(clienteId, input)}
    />
  )
}

function CategoriaEditRoute({
  onSave,
  onCancel,
}: {
  onSave: (id: number, input: CategoriaCompromissoInput) => Promise<void>
  onCancel: () => void
}) {
  const { id } = useParams<{ id: string }>()
  const categoriaId = Number(id)
  const isInvalidId = Number.isNaN(categoriaId) || categoriaId <= 0
  const [categoria, setCategoria] = useState<CategoriaCompromisso | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(!isInvalidId)

  useEffect(() => {
    if (isInvalidId) return

    let active = true
    getCategoria(categoriaId)
      .then((data) => {
        if (active) setCategoria(data)
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
  }, [categoriaId, isInvalidId])

  if (isInvalidId) {
    return (
      <EditRouteError
        backLabel="Voltar à lista"
        kicker="Organização"
        message="Identificador de categoria inválido."
        onBack={onCancel}
        title="Categoria não encontrada"
      />
    )
  }

  if (isLoading) {
    return <EditRouteLoading message="Carregando categoria…" />
  }

  if (error || !categoria) {
    return (
      <EditRouteError
        backLabel="Voltar à lista"
        kicker="Organização"
        message={error || 'Não foi possível carregar a categoria solicitada.'}
        onBack={onCancel}
        title="Categoria não encontrada"
      />
    )
  }

  return (
    <CategoriasForm
      initialValue={categoria}
      onCancel={onCancel}
      onSave={(input) => onSave(categoriaId, input)}
    />
  )
}

export default function App() {
  const [administrator, setAdministrator] = useState(getStoredAdministrator)
  const [showLogin, setShowLogin] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    apiRequest<Administrador>('/administradores/sessao')
      .then((sessionAdmin) => {
        if (!active) return
        setAdministrator(sessionAdmin)
        sessionStorage.setItem(
          'atelie-administrador',
          JSON.stringify(sessionAdmin),
        )
      })
      .catch(() => {
        if (!active) return
        setAdministrator(null)
        sessionStorage.removeItem('atelie-administrador')
      })

    function onUnauthorized() {
      setAdministrator(null)
      sessionStorage.removeItem('atelie-administrador')
      navigate('/')
    }

    window.addEventListener('atelie:unauthorized', onUnauthorized)
    return () => {
      active = false
      window.removeEventListener('atelie:unauthorized', onUnauthorized)
    }
  }, [navigate])

  function handleLoginSuccess(admin: Administrador) {
    sessionStorage.setItem('atelie-administrador', JSON.stringify(admin))
    setAdministrator(admin)
    setShowLogin(false)
    navigate('/painel/compromissos')
  }

  async function handleLogout() {
    try {
      await apiRequest('/administradores/logout', { method: 'POST' })
    } catch {
      // Ignora erro se sessão já foi invalidada
    } finally {
      sessionStorage.removeItem('atelie-administrador')
      setAdministrator(null)
      navigate('/')
    }
  }

  async function handleCreateCliente(input: ClienteInput) {
    await createCliente(input)
    setRefreshToken((value) => value + 1)
    navigate('/painel/clientes')
  }

  async function handleUpdateCliente(id: number, input: ClienteInput) {
    await updateCliente(id, input)
    setRefreshToken((value) => value + 1)
    navigate('/painel/clientes')
  }

  async function handleCreateCategoria(input: CategoriaCompromissoInput) {
    await createCategoria(input)
    setRefreshToken((value) => value + 1)
    navigate('/painel/categorias')
  }

  async function handleUpdateCategoria(
    id: number,
    input: CategoriaCompromissoInput,
  ) {
    await updateCategoria(id, input)
    setRefreshToken((value) => value + 1)
    navigate('/painel/categorias')
  }

  async function handleCreateCompromisso(input: CompromissoInput) {
    await createCompromisso(input)
    setRefreshToken((value) => value + 1)
    navigate('/painel/compromissos')
  }

  async function handleUpdateCompromisso(id: number, input: CompromissoInput) {
    await updateCompromisso(id, input)
    setRefreshToken((value) => value + 1)
    navigate('/painel/compromissos')
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Homepage
              onLogin={() => {
                if (administrator) {
                  navigate('/painel/compromissos')
                } else {
                  setShowLogin(true)
                }
              }}
            />
            {showLogin && (
              <LoginForm
                onCancel={() => setShowLogin(false)}
                onSuccess={handleLoginSuccess}
              />
            )}
          </>
        }
      />

      <Route
        path="/painel"
        element={
          administrator ? (
            <AdminLayout
              administrator={administrator}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route
          index
          element={<Navigate to="/painel/compromissos" replace />}
        />

        {/* Compromissos */}
        <Route
          path="compromissos"
          element={
            <CompromissosList
              onChanged={() => setRefreshToken((value) => value + 1)}
              onCreate={() => navigate('/painel/compromissos/novo')}
              onEdit={(compromisso) =>
                navigate(
                  `/painel/compromissos/${compromisso.idCompromisso}/editar`,
                )
              }
              refreshToken={refreshToken}
            />
          }
        />
        <Route
          path="compromissos/novo"
          element={
            <CompromissosForm
              administratorId={administrator?.idAdministrador ?? 0}
              initialValue={null}
              onCancel={() => navigate('/painel/compromissos')}
              onSave={handleCreateCompromisso}
            />
          }
        />
        <Route
          path="compromissos/:id/editar"
          element={
            <CompromissoEditRoute
              administratorId={administrator?.idAdministrador ?? 0}
              onCancel={() => navigate('/painel/compromissos')}
              onSave={handleUpdateCompromisso}
            />
          }
        />

        {/* Clientes */}
        <Route
          path="clientes"
          element={
            <ClientesList
              onCreate={() => navigate('/painel/clientes/novo')}
              onEdit={(cliente) =>
                navigate(`/painel/clientes/${cliente.idCliente}/editar`)
              }
              refreshToken={refreshToken}
            />
          }
        />
        <Route
          path="clientes/novo"
          element={
            <ClientesForm
              initialValue={null}
              onCancel={() => navigate('/painel/clientes')}
              onSave={handleCreateCliente}
            />
          }
        />
        <Route
          path="clientes/:id/editar"
          element={
            <ClienteEditRoute
              onCancel={() => navigate('/painel/clientes')}
              onSave={handleUpdateCliente}
            />
          }
        />

        {/* Categorias */}
        <Route
          path="categorias"
          element={
            <CategoriasList
              onCreate={() => navigate('/painel/categorias/novo')}
              onEdit={(categoria) =>
                navigate(`/painel/categorias/${categoria.idCategoria}/editar`)
              }
              refreshToken={refreshToken}
            />
          }
        />
        <Route
          path="categorias/novo"
          element={
            <CategoriasForm
              initialValue={null}
              onCancel={() => navigate('/painel/categorias')}
              onSave={handleCreateCategoria}
            />
          }
        />
        <Route
          path="categorias/:id/editar"
          element={
            <CategoriaEditRoute
              onCancel={() => navigate('/painel/categorias')}
              onSave={handleUpdateCategoria}
            />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/painel/compromissos" replace />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
