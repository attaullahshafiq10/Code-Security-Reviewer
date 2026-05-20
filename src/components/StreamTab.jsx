import { useState, useRef, useEffect } from 'react'
import { Terminal, Loader, Square } from 'lucide-react'
import { streamAnalysis } from '../utils/claude.js'
import { LANGUAGES } from '../utils/severity.js'
import styles from './ReviewTab.module.css'
import streamStyles from './StreamTab.module.css'

export default function StreamTab({ apiKey }) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('auto')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const abortRef = useRef(false)
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const handleStream = async () => {
    if (!code.trim()) { setError('Please paste some code first.'); return }
    if (!apiKey) { setError('Please set your Anthropic API key first.'); return }
    setLoading(true)
    setError('')
    setOutput('')
    abortRef.current = false

    try {
      for await (const chunk of streamAnalysis({ apiKey, code, language, context })) {
        if (abortRef.current) break
        setOutput(prev => prev + chunk)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStop = () => { abortRef.current = true; setLoading(false) }

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
            placeholder="Context..."
            className={styles.contextInput}
          />
        </div>
      </div>

      <div className={streamStyles.info}>
        <Terminal size={13} />
        Full narrative analysis — technical deep-dive without JSON post-processing. No false-positive filtering.
      </div>

      <textarea
        className={styles.codeInput}
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Paste any code for detailed streaming security analysis..."
        spellCheck={false}
      />

      <div className={styles.actions}>
        {loading ? (
          <button className={`${styles.scanBtn} ${styles.stopBtn}`} onClick={handleStop} type="button">
            <Square size={14} />
            Stop
          </button>
        ) : (
          <button className={styles.scanBtn} onClick={handleStream} disabled={loading} type="button">
            <Terminal size={16} />
            Stream Analysis
          </button>
        )}
        {loading && <span className={styles.status}><span className={styles.dot} />Streaming from Claude...</span>}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {output && (
        <div className={streamStyles.outputWrap}>
          <div className={streamStyles.outputHeader}>
            <Terminal size={13} />
            Raw analysis output
            {loading && <span className={streamStyles.liveTag}>LIVE</span>}
          </div>
          <pre className={streamStyles.output} ref={outputRef}>{output}</pre>
        </div>
      )}
    </div>
  )
}
