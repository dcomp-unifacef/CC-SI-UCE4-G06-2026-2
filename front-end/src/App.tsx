import { useState } from 'react'
import './App.css'
import Homepage from './components/Homepage'
import LoginForm from './components/LoginForm'
import ClientesForm from './components/ClientesForm'
import ClientesList from './components/ClientesList'
import CategoriasForm from './components/CategoriasForm'
import CategoriasList from './components/CategoriasList'
import CompromissosForm from './components/CompromissosForm'
import CompromissosList from './components/CompromissosList'
import { createCategoria, updateCategoria } from './data/categoriasCompromisso'
import { createCliente, updateCliente } from './data/clientes'
import { createCompromisso, updateCompromisso } from './data/compromissos'
import type { Administrador } from './types/Administrador'
import type {
  CategoriaCompromisso,
  CategoriaCompromissoInput,
} from './types/CategoriaCompromisso'
import type { Cliente, ClienteInput } from './types/Cliente'
import type { Compromisso, CompromissoInput } from './types/Compromisso'

type DashboardSection = 'compromissos' | 'clientes' | 'categorias'

const todayLabel = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
}).format(new Date())

function getStoredAdministrator(): Administrador | null {
  try {
    const stored = sessionStorage.getItem('atelie-administrador')
    return stored ? (JSON.parse(stored) as Administrador) : null
  } catch {
    return null
  }
}

const sections: Array<{
  id: DashboardSection
  title: string
  icon: string
}> = [
  { id: 'compromissos', title: 'Agenda', icon: '▦' },
  { id: 'clientes', title: 'Clientes', icon: '◌' },
  { id: 'categorias', title: 'Categorias', icon: '◈' },
]

export default function App() {
  const [administrator, setAdministrator] = useState(getStoredAdministrator)
  const [showLogin, setShowLogin] = useState(false)
  const [section, setSection] = useState<DashboardSection>('compromissos')
  const [refreshToken, setRefreshToken] = useState(0)
  const [editingClient, setEditingClient] = useState<Cliente | null | undefined>(undefined)
  const [editingCategory, setEditingCategory] = useState<
    CategoriaCompromisso | null | undefined
  >(undefined)
  const [editingAppointment, setEditingAppointment] = useState<
    Compromisso | null | undefined
  >(undefined)

  function handleLoginSuccess(admin: Administrador) {
    sessionStorage.setItem('atelie-administrador', JSON.stringify(admin))
    setAdministrator(admin)
    setShowLogin(false)
  }

  function handleLogout() {
    sessionStorage.removeItem('atelie-administrador')
    setAdministrator(null)
    setSection('compromissos')
    setEditingClient(undefined)
    setEditingCategory(undefined)
    setEditingAppointment(undefined)
  }

  function changeSection(nextSection: DashboardSection) {
    setSection(nextSection)
    setEditingClient(undefined)
    setEditingCategory(undefined)
    setEditingAppointment(undefined)
  }

  async function saveCliente(input: ClienteInput) {
    if (editingClient) {
      await updateCliente(editingClient.idCliente, input)
    } else {
      await createCliente(input)
    }
    setEditingClient(undefined)
    setRefreshToken((value) => value + 1)
  }

  async function saveCategoria(input: CategoriaCompromissoInput) {
    if (editingCategory) {
      await updateCategoria(editingCategory.idCategoria, input)
    } else {
      await createCategoria(input)
    }
    setEditingCategory(undefined)
    setRefreshToken((value) => value + 1)
  }

  async function saveCompromisso(input: CompromissoInput) {
    if (editingAppointment) {
      await updateCompromisso(editingAppointment.idCompromisso, input)
    } else {
      await createCompromisso(input)
    }
    setEditingAppointment(undefined)
    setRefreshToken((value) => value + 1)
  }

  if (!administrator) {
    return (
      <>
        <Homepage onLogin={() => setShowLogin(true)} />
        {showLogin && (
          <LoginForm
            onCancel={() => setShowLogin(false)}
            onSuccess={handleLoginSuccess}
          />
        )}
      </>
    )
  }

  const activeSection = sections.find((item) => item.id === section)

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a aria-label="Auctus, painel" className="brand admin-brand" href="#painel">
          <span aria-hidden="true" className="brand-mark">A</span>
          <span>AUCTUS</span>
        </a>
        <div className="sidebar-label">ESPAÇO DE TRABALHO</div>
        <nav aria-label="Menu do painel" className="dashboard-nav">
          {sections.map((item) => (
            <button
              aria-current={section === item.id ? 'page' : undefined}
              className={`dashboard-nav-link${section === item.id ? ' is-active' : ''}`}
              key={item.id}
              onClick={() => changeSection(item.id)}
              type="button"
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.title}
              {section === item.id && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-mark">✳</span>
            <b>Um dia de cada vez.</b>
            <p>Seu trabalho, organizado com cuidado.</p>
          </div>
          <button className="sidebar-site-link" onClick={handleLogout} type="button">
            ← Sair do painel
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="breadcrumb"><span>Auctus</span><i>/</i><b>{activeSection?.title}</b></div>
          <div className="admin-profile">
            <span className="profile-avatar">{administrator.username.slice(0, 1).toUpperCase()}</span>
            <span><b>{administrator.username}</b><small>Administrador</small></span>
            <button aria-label="Sair da conta" className="text-button profile-logout" onClick={handleLogout} type="button">
              Sair
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <div>
              <span className="eyebrow">SEU ESPAÇO, NO SEU RITMO</span>
              <h1>{section === 'compromissos' ? 'Olá, ' : ''}{section === 'compromissos' ? administrator.username : activeSection?.title}<span>.</span></h1>
              <p>
                {section === 'compromissos'
                  ? 'Aqui está um pouco de clareza para o que vem pela frente.'
                  : section === 'clientes'
                    ? 'Acompanhe as pessoas e os negócios que fazem parte da sua jornada.'
                    : 'Organize seus compromissos por tipo e encontre tudo com facilidade.'}
              </p>
            </div>
            <span className="welcome-date">
              <svg aria-hidden="true"><use href="/icons.svg#calendar" /></svg>
              {todayLabel}
            </span>
          </div>

          <div className="mobile-section-nav" aria-label="Seções do painel">
            {sections.map((item) => (
              <button
                aria-current={section === item.id ? 'page' : undefined}
                className={section === item.id ? 'is-active' : ''}
                key={item.id}
                onClick={() => changeSection(item.id)}
                type="button"
              >
                {item.title}
              </button>
            ))}
          </div>

          {section === 'compromissos' && (
            editingAppointment !== undefined ? (
              <CompromissosForm
                administratorId={administrator.idAdministrador}
                initialValue={editingAppointment}
                onCancel={() => setEditingAppointment(undefined)}
                onSave={saveCompromisso}
              />
            ) : (
              <CompromissosList
                onChanged={() => setRefreshToken((value) => value + 1)}
                onCreate={() => setEditingAppointment(null)}
                onEdit={setEditingAppointment}
                refreshToken={refreshToken}
              />
            )
          )}

          {section === 'clientes' && (
            editingClient !== undefined ? (
              <ClientesForm
                initialValue={editingClient}
                onCancel={() => setEditingClient(undefined)}
                onSave={saveCliente}
              />
            ) : (
              <ClientesList
                onCreate={() => setEditingClient(null)}
                onEdit={setEditingClient}
                refreshToken={refreshToken}
              />
            )
          )}

          {section === 'categorias' && (
            editingCategory !== undefined ? (
              <CategoriasForm
                initialValue={editingCategory}
                onCancel={() => setEditingCategory(undefined)}
                onSave={saveCategoria}
              />
            ) : (
              <CategoriasList
                onCreate={() => setEditingCategory(null)}
                onEdit={setEditingCategory}
                refreshToken={refreshToken}
              />
            )
          )}
          <footer className="dashboard-footer">feito com cuidado <span>✳</span></footer>
        </div>
      </main>
    </div>
  )
}