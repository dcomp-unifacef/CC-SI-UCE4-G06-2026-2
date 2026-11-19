import { useState, type FormEvent } from 'react'
import type { Administrador } from '../types/Administrador'
import { apiRequest, getErrorMessage, jsonBody } from '../services/api'

interface LoginFormProps {
  onSuccess: (administrador: Administrador) => void
  onCancel: () => void
}

export default function LoginForm({ onSuccess, onCancel }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const administrador = await apiRequest<Administrador>(
        '/administradores/autenticar',
        {
          method: 'POST',
          body: jsonBody({ username, senha }),
        },
      )
      onSuccess(administrador)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel()
    }}>
      <section
        aria-labelledby="login-title"
        aria-modal="true"
        className="dialog login-dialog"
        role="dialog"
      >
        <button
          aria-label="Fechar janela de acesso"
          className="icon-button dialog-close"
          onClick={onCancel}
          type="button"
        >
          <svg aria-hidden="true"><use href="/icons.svg#close" /></svg>
        </button>
        <span className="eyebrow">Área administrativa</span>
        <h2 id="login-title">Bom ter você de volta.</h2>
        <p>Entre para organizar seus clientes e compromissos.</p>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="form-label">
            Usuário
            <input
              autoComplete="username"
              className="form-control"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </label>
          <label className="form-label">
            Senha
            <input
              autoComplete="current-password"
              className="form-control"
              onChange={(event) => setSenha(event.target.value)}
              required
              type="password"
              value={senha}
            />
          </label>
          {error && <p className="alert alert-danger form-error py-2 px-3 my-2" role="alert">{error}</p>}
          <button className="btn button button-dark button-full w-100 mt-2" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Verificando…' : 'Entrar no painel'}
          </button>
        </form>
        <button className="btn text-button login-cancel text-decoration-none" onClick={onCancel} type="button">
          Voltar ao site
        </button>
      </section>
    </div>
  )
}