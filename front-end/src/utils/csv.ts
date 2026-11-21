export type CsvValue = string | number

function escapeCsvCell(value: CsvValue): string {
  const text = String(value)
  const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}

export function downloadCsv(
  filename: string,
  rows: readonly (readonly CsvValue[])[],
): void {
  const content = `\uFEFF${rows
    .map((row) => row.map(escapeCsvCell).join(';'))
    .join('\r\n')}`
  const file = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)

  try {
    link.click()
  } finally {
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}
