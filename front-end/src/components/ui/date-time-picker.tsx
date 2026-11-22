import * as React from 'react'
import { CalendarIcon, ChevronDownIcon } from '../admin/AdminIcons'

const MONTH_SHORT = [
  'jan.',
  'fev.',
  'mar.',
  'abr.',
  'mai.',
  'jun.',
  'jul.',
  'ago.',
  'set.',
  'out.',
  'nov.',
  'dez.',
]

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const COMMON_TIME_SLOTS = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
]

export interface DateTimePickerProps {
  id?: string
  value: string // YYYY-MM-DDTHH:mm format
  onChange: (value: string) => void
  min?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

function parseDateTime(val: string): {
  year: number
  month: number
  day: number
  time: string
} | null {
  if (!val) return null
  const [datePart, timePart] = val.split('T')
  if (!datePart) return null
  const [y, m, d] = datePart.split('-').map(Number)
  if (!y || !m || !d) return null
  const time = timePart ? timePart.slice(0, 5) : '09:00'
  return { year: y, month: m - 1, day: d, time }
}

function formatDisplay(val: string): string {
  const parsed = parseDateTime(val)
  if (!parsed) return ''
  const dd = String(parsed.day).padStart(2, '0')
  const mm = String(parsed.month + 1).padStart(2, '0')
  return `${dd}/${mm}/${parsed.year} às ${parsed.time}`
}

export function DateTimePicker({
  id,
  value,
  onChange,
  min: _min,
  placeholder = 'Selecionar data e horário',
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const parsed = React.useMemo(() => parseDateTime(value), [value])
  const [today, setToday] = React.useState(() => new Date())

  React.useEffect(() => {
    let timeoutId: number

    function scheduleNextDay() {
      const now = new Date()
      const nextDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      )

      timeoutId = window.setTimeout(() => {
        setToday(new Date())
        scheduleNextDay()
      }, nextDay.getTime() - now.getTime())
    }

    scheduleNextDay()
    return () => window.clearTimeout(timeoutId)
  }, [])

  const [navOffset, setNavOffset] = React.useState<{
    year: number
    month: number
  } | null>(null)

  const viewYear = navOffset?.year ?? parsed?.year ?? today.getFullYear()
  const viewMonth = navOffset?.month ?? parsed?.month ?? today.getMonth()

  // Fecha ao clicar fora
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

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setNavOffset({ year: viewYear - 1, month: 11 })
    } else {
      setNavOffset({ year: viewYear, month: viewMonth - 1 })
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setNavOffset({ year: viewYear + 1, month: 0 })
    } else {
      setNavOffset({ year: viewYear, month: viewMonth + 1 })
    }
  }

  function handleSelectDay(year: number, month: number, day: number) {
    const time = parsed ? parsed.time : '09:00'
    const yStr = String(year)
    const mStr = String(month + 1).padStart(2, '0')
    const dStr = String(day).padStart(2, '0')
    onChange(`${yStr}-${mStr}-${dStr}T${time}`)
    setNavOffset({ year, month })
  }

  function handleSelectTime(time: string) {
    const year = parsed ? parsed.year : viewYear
    const month = parsed ? parsed.month : viewMonth
    const day = parsed ? parsed.day : today.getDate()
    const yStr = String(year)
    const mStr = String(month + 1).padStart(2, '0')
    const dStr = String(day).padStart(2, '0')
    onChange(`${yStr}-${mStr}-${dStr}T${time}`)
  }

  // Gera dias do calendário
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()

  const calendarCells = []

  // Dias do mês anterior
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      year: viewMonth === 0 ? viewYear - 1 : viewYear,
      month: viewMonth === 0 ? 11 : viewMonth - 1,
      day: prevMonthDays - i,
      isCurrentMonth: false,
    })
  }

  // Dias do mês atual
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      year: viewYear,
      month: viewMonth,
      day: d,
      isCurrentMonth: true,
    })
  }

  // Completa dias do próximo mês
  const remaining = 42 - calendarCells.length
  for (let d = 1; d <= remaining && calendarCells.length < 35; d++) {
    calendarCells.push({
      year: viewMonth === 11 ? viewYear + 1 : viewYear,
      month: viewMonth === 11 ? 0 : viewMonth + 1,
      day: d,
      isCurrentMonth: false,
    })
  }

  const currentTime = parsed ? parsed.time : ''

  return (
    <div
      className={`auctus-dtp-container ${className ?? ''}`}
      ref={containerRef}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="auctus-dtp-trigger"
        disabled={disabled}
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <span className="auctus-dtp-icon">
          <CalendarIcon />
        </span>
        <span className={`auctus-dtp-text ${!value ? 'is-placeholder' : ''}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <span className="auctus-dtp-chevron">
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <div className="auctus-dtp-popover">
          <div className="auctus-dtp-body">
            {/* Calendário da Esquerda */}
            <div className="auctus-dtp-calendar">
              {/* Header com navegação do mês/ano */}
              <div className="auctus-dtp-header">
                <button
                  aria-label="Mês anterior"
                  className="auctus-dtp-nav-btn"
                  onClick={handlePrevMonth}
                  type="button"
                >
                  ‹
                </button>
                <div className="auctus-dtp-title">
                  <span className="auctus-dtp-month">
                    {MONTH_SHORT[viewMonth]}
                  </span>
                  <span className="auctus-dtp-year">{viewYear}</span>
                </div>
                <button
                  aria-label="Próximo mês"
                  className="auctus-dtp-nav-btn"
                  onClick={handleNextMonth}
                  type="button"
                >
                  ›
                </button>
              </div>

              {/* Dias da semana */}
              <div className="auctus-dtp-weekdays">
                {WEEK_DAYS.map((wd, idx) => (
                  <span className="auctus-dtp-weekday" key={`${wd}-${idx}`}>
                    {wd}
                  </span>
                ))}
              </div>

              {/* Grid dos dias */}
              <div className="auctus-dtp-days">
                {calendarCells.map((cell, idx) => {
                  const isSelected =
                    parsed !== null &&
                    parsed.year === cell.year &&
                    parsed.month === cell.month &&
                    parsed.day === cell.day
                  const isToday =
                    cell.year === today.getFullYear() &&
                    cell.month === today.getMonth() &&
                    cell.day === today.getDate()

                  return (
                    <button
                      className={`auctus-dtp-day-btn${
                        !cell.isCurrentMonth ? ' is-outside' : ''
                      }${isSelected ? ' is-selected' : ''}${
                        isToday ? ' is-today' : ''
                      }`}
                      key={`day-${cell.year}-${cell.month}-${cell.day}-${idx}`}
                      onClick={() =>
                        handleSelectDay(cell.year, cell.month, cell.day)
                      }
                      type="button"
                    >
                      {cell.day}
                    </button>
                  )
                })}
              </div>

              {/* Ações rápidas */}
              <div className="auctus-dtp-quick-actions">
                <button
                  className="auctus-dtp-quick-btn"
                  onClick={() => {
                    handleSelectDay(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate(),
                    )
                  }}
                  type="button"
                >
                  Hoje
                </button>
                {value && (
                  <button
                    className="auctus-dtp-quick-btn is-clear"
                    onClick={() => onChange('')}
                    type="button"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Painel lateral de Horários */}
            <div className="auctus-dtp-times">
              <div className="auctus-dtp-times-header">Horários</div>
              <div className="auctus-dtp-times-list">
                {COMMON_TIME_SLOTS.map((time) => {
                  const isTimeSelected = currentTime === time
                  return (
                    <button
                      className={`auctus-dtp-time-btn${
                        isTimeSelected ? ' is-selected' : ''
                      }`}
                      key={time}
                      onClick={() => handleSelectTime(time)}
                      type="button"
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
              <div className="auctus-dtp-custom-time">
                <label
                  className="auctus-dtp-custom-label"
                  htmlFor="dtp-manual-time"
                >
                  Outro horário:
                </label>
                <input
                  className="auctus-dtp-custom-input"
                  id="dtp-manual-time"
                  onChange={(e) => {
                    if (e.target.value) handleSelectTime(e.target.value)
                  }}
                  type="time"
                  value={currentTime}
                />
              </div>
            </div>
          </div>

          <div className="auctus-dtp-footer">
            <button
              className="auctus-dtp-done-btn"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
