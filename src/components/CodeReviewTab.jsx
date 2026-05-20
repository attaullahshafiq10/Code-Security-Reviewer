import { useState } from 'react'
import { Scan, Loader, FileCode } from 'lucide-react'
import { analyzeCode } from '../utils/claude.js'
import { LANGUAGES, EXAMPLE_CODE } from '../utils/severity.js'
import ResultsPanel from './ResultsPanel.jsx'
import styles from './ReviewTab.module.css'

const CHECKS = [
  { id: 'owasp', label: 'OWASP Top 10', default: true },
  { id: 'secrets', label: 'Secrets & Credentials', default: true },
  { id: 'auth', label: 'Auth & Access Control', default: true },
  { id: 'injection', label: 'Injection Attacks', default: true },
  { id: 'crypto', label: 'Cryptography', default: false },
  { id: 'supply', label: 'Supply Chain', default: false },
]

export default function CodeReviewTab({ apiKey }) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('auto')
  const [context, setContext] = useState('')
  const [checks, setChecks] = useState(() => Object.fromEntries(CHECKS.map(c => [c.id, c.default])))
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const loadExample = () => {
    const lang = language === 'auto' ? 'python' : language
    const ex = EXAMPLE_CODE[lang] || EXAMPLE_CODE.python
    setCode(ex)
    setLanguage(lang === 'auto' ? 'python' : lang)
    setContext('REST API endpoint')
    setResult(null)
    setError('')
  }

  const handleScan = async () => {
    if (!code.trim()) { setError('Please paste some code first.'); return }
    if (!apiKey) { setError('Please set your Anthropic API key first.'); return }
    setLoading(true)
    setError('')
    setResult(null)
    setStatus('Initializing AI security engine...')

    const statusMessages = [
      'Parsing code structure...',
      'Analyzing semantic patterns...',
      'Checking for injection vectors...',
      'Scanning for secrets and credentials...',
      'Evaluating authentication logic...',
      'Filtering false positives...',
      'Generating findings report...',
    ]
    let msgIdx = 0
    const ticker = setInterval(() => {
      setStatus(statusMessages[msgIdx % statusMessages.length])
      msgIdx++
    }, 1800)

    try {
      const activeChecks = Object.entries(checks).filter(([,v]) => v).map(([k]) => k).join(', ')
      const res = await analyzeCode({
        apiKey,
        code,
        language: language === 'auto' ? 'auto-detect' : language,
        context: context + (activeChecks ? ` | Checks: ${activeChecks}` : ''),
        mode: 'code',
      })
      setResult(res)
      setStatus('')
    } catch (e) {
      setError(e.message)
      setStatus('')
    } finally {
      clearInterval(ticker)
      setLoading(false)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <select value={language} onChange={e => setLanguage(e.target.value)} className={styles.select}>
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <input
            type="text"
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Context (e.g. REST API auth module)..."
            className={styles.contextInput}
          />
        </div>
        <button className={styles.exampleBtn} onClick={loadExample} type="button">
          <FileCode size={14} />
          Load example
        </button>
      </div>

      <textarea
        className={styles.codeInput}
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder={`Paste your code here...\n\n// Example:\napp.get('/user', (req, res) => {\n  const id = req.query.id;\n  db.query('SELECT * FROM users WHERE id = ' + id, ...);\n});`}
        spellCheck={false}
        data-gramm="false"
      />

      <div className={styles.checksRow}>
        {CHECKS.map(c => (
          <label key={c.id} className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={checks[c.id]}
              onChange={e => setChecks(prev => ({ ...prev, [c.id]: e.target.checked }))}
            />
            {c.label}
          </label>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.scanBtn}
          onClick={handleScan}
          disabled={loading}
          type="button"
        >
          {loading ? <Loader size={16} className={styles.spin} /> : <Scan size={16} />}
          {loading ? 'Scanning...' : 'Scan for Vulnerabilities'}
        </button>
        {status && (
          <span className={styles.status}>
            <span className={styles.dot} />
            {status}
          </span>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}
      <ResultsPanel result={result} />
    </div>
  )
}
