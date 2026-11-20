import { ArrowLeftIcon } from './AdminIcons'

interface EditRouteStateProps {
  kicker: string
  title: string
  backLabel: string
  message: string
  onBack: () => void
}

export function EditRouteLoading({ message }: { message: string }) {
  return (
    <div className="auctus-surface">
      <div className="auctus-empty">{message}</div>
    </div>
  )
}

export function EditRouteError({
  kicker,
  title,
  backLabel,
  message,
  onBack,
}: EditRouteStateProps) {
  return (
    <section className="auctus-surface">
      <div className="auctus-form-header">
        <div>
          <span className="auctus-page-kicker">{kicker}</span>
          <h2>{title}</h2>
        </div>
        <button className="auctus-btn-link" onClick={onBack} type="button">
          <ArrowLeftIcon />
          <span>{backLabel}</span>
        </button>
      </div>
      <p className="alert alert-danger py-2 px-3 mb-0" role="alert">
        {message}
      </p>
      <div className="auctus-form-actions">
        <button className="auctus-btn-secondary" onClick={onBack} type="button">
          {backLabel}
        </button>
      </div>
    </section>
  )
}
