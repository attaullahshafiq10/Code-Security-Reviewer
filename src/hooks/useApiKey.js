import { useState, useEffect } from 'react'

const KEY = 'securereview_api_key'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => {
    try { return localStorage.getItem(KEY) || '' } catch { return '' }
  })
  const [showKey, setShowKey] = useState(false)

  const setApiKey = (key) => {
    setApiKeyState(key)
    try { localStorage.setItem(KEY, key) } catch {}
  }

  const clearApiKey = () => {
    setApiKeyState('')
    try { localStorage.removeItem(KEY) } catch {}
  }

  return { apiKey, setApiKey, clearApiKey, showKey, setShowKey }
}
