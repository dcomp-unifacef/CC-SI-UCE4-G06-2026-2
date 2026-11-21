interface TarefasChecklistProps {
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  label?: string
}

export default function TarefasChecklist({
  checked,
  onToggle,
  disabled = false,
  label = 'compromisso',
}: TarefasChecklistProps) {
  return (
    <button
      aria-checked={checked}
      aria-label={`${checked ? 'Marcar como pendente' : 'Marcar como concluído'}: ${label}`}
      className={`task-checkbox${checked ? ' is-checked' : ''}`}
      disabled={disabled}
      onClick={onToggle}
      role="checkbox"
      type="button"
    >
      {checked && <svg aria-hidden="true"><use href="/icons.svg#check" /></svg>}
    </button>
  )
}