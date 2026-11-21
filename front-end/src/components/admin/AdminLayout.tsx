import { Link, NavLink, Outlet } from 'react-router-dom'
import '../../styles/admin.css'
import type { Administrador } from '../../types/Administrador'
import {
  CalendarIcon,
  ChartIcon,
  LogoutIcon,
  TagIcon,
  UsersIcon,
} from './AdminIcons'
import UpcomingNotifications from './UpcomingNotifications'

type DashboardSection = 'compromissos' | 'clientes' | 'categorias' | 'relatorios'

const todayLabel = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
}).format(new Date())

const sections: Array<{
  id: DashboardSection
  path: string
  title: string
}> = [
  { id: 'compromissos', path: '/painel/compromissos', title: 'Agenda' },
  { id: 'clientes', path: '/painel/clientes', title: 'Clientes' },
  { id: 'categorias', path: '/painel/categorias', title: 'Categorias' },
  { id: 'relatorios', path: '/painel/relatorios', title: 'Relatórios' },
]

function SectionIcon({ section }: { section: DashboardSection }) {
  if (section === 'compromissos') return <CalendarIcon />
  if (section === 'clientes') return <UsersIcon />
  if (section === 'categorias') return <TagIcon />
  return <ChartIcon />
}

interface AdminLayoutProps {
  administrator: Administrador
  onLogout: () => void
  refreshToken: number
}

export default function AdminLayout({
  administrator,
  onLogout,
  refreshToken,
}: AdminLayoutProps) {
  return (
    <div className="auctus-shell">
      <aside className="auctus-sidebar">
        <Link
          aria-label="Auctus, ir para agenda"
          className="auctus-sidebar-brand"
          to="/painel/compromissos"
        >
          <img alt="" className="auctus-logo" src="/logo-auctus.png" />
        </Link>

        <div className="auctus-sidebar-group-label">Espaço de trabalho</div>
        <nav aria-label="Menu principal do painel" className="auctus-sidebar-nav">
          {sections.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `auctus-nav-item${isActive ? ' is-active' : ''}`
              }
              key={item.id}
              to={item.path}
            >
              <SectionIcon section={item.id} />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="auctus-sidebar-footer">
          <button
            className="auctus-sidebar-logout"
            onClick={onLogout}
            type="button"
          >
            <LogoutIcon />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <div className="auctus-main">
        <header className="auctus-header">
          <div className="auctus-header-left">
            <Link
              aria-label="Auctus, ir para agenda"
              className="auctus-mobile-brand"
              to="/painel/compromissos"
            >
              <img alt="" className="auctus-logo" src="/logo-auctus.png" />
            </Link>
          </div>

          <div className="auctus-header-right">
            <UpcomingNotifications refreshToken={refreshToken} />
            <span className="auctus-header-date" title="Data atual">
              <CalendarIcon />
              <span>{todayLabel}</span>
            </span>
            <span aria-hidden="true" className="auctus-header-divider" />
            <div className="auctus-user-badge">
              <span aria-hidden="true" className="auctus-user-avatar">
                {administrator.username.slice(0, 1).toUpperCase()}
              </span>
              <div className="auctus-user-meta">
                <span className="auctus-user-name">
                  {administrator.username}
                </span>
                <span className="auctus-user-role">Administrador</span>
              </div>
            </div>
            <button
              aria-label="Sair da conta"
              className="auctus-header-logout"
              onClick={onLogout}
              type="button"
            >
              <LogoutIcon />
              <span>Sair</span>
            </button>
          </div>
        </header>

        <nav aria-label="Seções do painel" className="auctus-subnav">
          {sections.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `auctus-subnav-link${isActive ? ' is-active' : ''}`
              }
              key={item.id}
              to={item.path}
            >
              <SectionIcon section={item.id} />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <main className="auctus-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
