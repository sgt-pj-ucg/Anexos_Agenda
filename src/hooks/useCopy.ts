import { useState } from 'react'

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const el = document.createElement('textarea')
      el.value = value
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(value)
    window.setTimeout(() => setCopied((c) => (c === value ? null : c)), 1500)
  }

  return { copied, copy }
}
