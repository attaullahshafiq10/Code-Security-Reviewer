import { useState } from 'react'
import { Shield, Eye, EyeOff, ExternalLink, Key } from 'lucide-react'
import styles from './ApiKeyModal.module.css'

export default function ApiKeyModal({ apiKey, setApiKey, onClose }) {
  const [value, setValue] = useState(apiKey)
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  const handleSave = () => {
    const v = value.trim()
    if (!v.startsWith('sk-ant-')) {
      setError('API key must start with sk-ant-')
      return
    }
    setApiKey(v)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="API Key Configuration">
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Key size={20} />
          </div>
          <div>
            <h2 className={styles.title}>Anthropic API Key</h2>
            <p className={styles.subtitle}>Stored locally in your browser. Never sent anywhere except Anthropic's API.</p>
          </div>
        </div>

        <div className={styles.body}>
          <label className={styles.label} htmlFor="apikey-input">API Key</label>
          <div className={styles.inputRow}>
            <input
              id="apikey-input"
              type={show ? 'text' : 'password'}
              value={value}
              onChange={e => { setValue(e.target.value); setError('') }}
              placeholder="sk-ant-api03-..."
              className={styles.input}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <button
              className={styles.toggle}
              onClick={() => setShow(s => !s)}
              aria-label={show ? 'Hide API key' : 'Show API key'}
              type="button"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.infoBox}>
            <Shield size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            <p>Your key is stored only in <code>localStorage</code> on your device. All API calls go directly to <code>api.anthropic.com</code>. This app has no backend.</p>
          </div>

          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.getKey}
          >
            Get an API key from Anthropic Console <ExternalLink size={13} />
          </a>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose} type="button">Cancel</button>
          <button className={styles.btnSave} onClick={handleSave} type="button">Save Key</button>
        </div>
      </div>
    </div>
  )
}
