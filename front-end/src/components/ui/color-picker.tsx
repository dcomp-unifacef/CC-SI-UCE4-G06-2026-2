import * as React from 'react'
import { CheckIcon, ChevronDownIcon } from '../admin/AdminIcons'

const PALETTE = [
  { name: 'Terracota Auctus', hex: '#C96442' },
  { name: 'Tijolo Intenso', hex: '#B84A32' },
  { name: 'Coral Suave', hex: '#E07A5F' },
  { name: 'Âmbar Dourado', hex: '#D4A373' },
  { name: 'Mostarda Quente', hex: '#E9C46A' },
  { name: 'Verde Sálvia', hex: '#84A98C' },
  { name: 'Verde Eucalipto', hex: '#52796F' },
  { name: 'Verde Floresta', hex: '#2A9D8F' },
  { name: 'Azul Ardósia', hex: '#457B9D' },
  { name: 'Azul Petróleo', hex: '#2B2D42' },
  { name: 'Lavanda Profundo', hex: '#7B2CBF' },
  { name: 'Rosa Queimado', hex: '#A23B72' },
]

export interface ColorPickerProps {
  id?: string
  value: string
  onChange: (color: string) => void
  disabled?: boolean
  className?: string
}

export function ColorPicker({
  id,
  value,
  onChange,
  disabled = false,
  className,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const activeColor = (value || '#C96442').toUpperCase()

  React.useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div
      className={`auctus-cp-container ${className ?? ''}`}
      ref={containerRef}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="auctus-cp-trigger"
        disabled={disabled}
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <span
          aria-hidden="true"
          className="auctus-cp-swatch"
          style={{ backgroundColor: activeColor }}
        />
        <code className="auctus-cp-hex">{activeColor}</code>
        <span className="auctus-cp-chevron">
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <div className="auctus-cp-popover">
          <div className="auctus-cp-title">Cores sugeridas</div>
          <div className="auctus-cp-grid">
            {PALETTE.map((item) => {
              const isSelected = activeColor === item.hex.toUpperCase()
              return (
                <button
                  aria-label={item.name}
                  className={`auctus-cp-swatch-btn${
                    isSelected ? ' is-selected' : ''
                  }`}
                  key={item.hex}
                  onClick={() => {
                    onChange(item.hex)
                    setIsOpen(false)
                  }}
                  style={{ backgroundColor: item.hex }}
                  title={`${item.name} (${item.hex})`}
                  type="button"
                >
                  {isSelected && <CheckIcon />}
                </button>
              )
            })}
          </div>

          <div className="auctus-cp-custom-row">
            <label className="auctus-cp-custom-label" htmlFor="cp-native-input">
              Cor personalizada:
            </label>
            <div className="auctus-cp-custom-control">
              <input
                className="auctus-cp-native-input"
                id="cp-native-input"
                onChange={(e) => onChange(e.target.value)}
                type="color"
                value={activeColor}
              />
              <input
                aria-label="Código hexadecimal da cor"
                className="auctus-cp-text-input"
                maxLength={7}
                onChange={(e) => {
                  const val = e.target.value
                  if (val.startsWith('#') || val.length === 6) {
                    onChange(val.startsWith('#') ? val : `#${val}`)
                  }
                }}
                placeholder="#C96442"
                type="text"
                value={activeColor}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
