import * as React from 'react'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { CheckIcon, ChevronDownIcon } from '../admin/AdminIcons'

export interface SelectOption {
  value: string
  label: string
  color?: string
}

export interface SelectProps {
  id?: string
  name?: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
}

export function Select({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder = 'Selecione…',
  disabled = false,
  className,
  triggerClassName,
}: SelectProps) {
  const optionsMap = React.useMemo(() => {
    const map = new Map<string, SelectOption>()
    for (const opt of options) {
      map.set(opt.value, opt)
    }
    return map
  }, [options])

  const itemsMap = React.useMemo(() => {
    const map: Record<string, string> = {}
    for (const opt of options) {
      map[opt.value] = opt.label
    }
    return map
  }, [options])

  const selectedOption = optionsMap.get(value)
  const selectedLabel = selectedOption?.label ?? placeholder

  return (
    <div className={`auctus-select-root ${className ?? ''}`}>
      <SelectPrimitive.Root
        disabled={disabled}
        items={itemsMap}
        name={name}
        onValueChange={(val) => {
          if (typeof val === 'string') {
            onValueChange(val)
          } else if (val === null) {
            onValueChange('')
          }
        }}
        value={value}
      >
        <SelectPrimitive.Trigger
          className={`auctus-select-trigger ${triggerClassName ?? ''}`}
          disabled={disabled}
          id={id}
        >
          <span
            className={`auctus-select-value ${!value ? 'is-placeholder' : ''}`}
          >
            {selectedOption?.color && (
              <span
                aria-hidden="true"
                className="auctus-select-color-dot"
                style={{ backgroundColor: selectedOption.color }}
              />
            )}
            <span className="auctus-select-value-text">{selectedLabel}</span>
          </span>
          <SelectPrimitive.Icon className="auctus-select-chevron">
            <ChevronDownIcon />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            align="start"
            className="auctus-select-positioner"
            side="bottom"
            sideOffset={6}
          >
            <SelectPrimitive.Popup className="auctus-select-popup">
              <SelectPrimitive.List className="auctus-select-list">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    className="auctus-select-item"
                    key={option.value}
                    value={option.value}
                  >
                    <div className="auctus-select-item-content">
                      {option.color && (
                        <span
                          aria-hidden="true"
                          className="auctus-select-color-dot"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <SelectPrimitive.ItemText className="auctus-select-item-text">
                        {option.label}
                      </SelectPrimitive.ItemText>
                    </div>
                    <SelectPrimitive.ItemIndicator className="auctus-select-item-indicator">
                      <CheckIcon />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}

export { SelectPrimitive }
