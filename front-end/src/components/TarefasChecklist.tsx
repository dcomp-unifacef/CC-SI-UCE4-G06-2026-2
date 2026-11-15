interface TarefasChecklistProps {
  checked: boolean
  onToggle: () => void
}

export default function TarefasChecklist({
  checked,
  onToggle,
}: TarefasChecklistProps) {
  return (
    <button
      aria-checked={checked}
      aria-label={checked ? 'Marcar compromisso como pendente' : 'Marcar compromisso como concluído'}
      className={`task-checkbox${checked ? ' is-checked' : ''}`}
      onClick={onToggle}
      role="checkbox"
      type="button"
    >
      {checked && <svg aria-hidden="true"><use href="/icons.svg#check" /></svg>}
    </button>
  )
}