import { useState } from 'react'
import { Shield, Key, Code, GitPullRequest, Terminal, Github, ExternalLink } from 'lucide-react'
import { useApiKey } from './hooks/useApiKey.js'
import ApiKeyModal from './components/ApiKeyModal.jsx'
import CodeReviewTab from './components/CodeReviewTab.jsx'
import DiffReviewTab from './components/DiffReviewTab.jsx'
import StreamTab from './components/StreamTab.jsx'
import styles from './App.module.css'

const TABS = [
  { id: 'code', label: 'Code Review', Icon: Code },
  { id: 'diff', label: 'Diff / PR', Icon: GitPullRequest },
  { id: 'stream', label: 'Raw Stream', Icon: Terminal },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('code')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const { apiKey, setApiKey } = useApiKey()

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Shield size={20} />
            </div>
            <div>
              <span className={styles.logoName}>SecureReview</span>
              <span className={styles.logoBadge}>NanoTechx</span>
            </div>
          </div>

          <nav className={styles.nav}>
            <a
              href="https://github.com/anthropics"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
            >
              <Github size={15} />
              <span>Inspired by Anthropic</span>
              <ExternalLink size={12} />
            </a>
            <button
              className={`${styles.keyBtn} ${apiKey ? styles.keySet : styles.keyMissing}`}
              onClick={() => setShowKeyModal(true)}
              type="button"
            >
              <Key size={14} />
              {apiKey ? 'API key set' : 'Set API key'}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            AI Security Engineer
            <br />
            <span className={styles.heroAccent}>for your codebase</span>
          </h1>
          <p className={styles.heroSub}>
            Detects real vulnerabilities with semantic understanding,
            not just pattern matching. Language agnostic. False-positive filtered.
          </p>
          <div className={styles.heroPills}>
            {['SQL Injection', 'Hardcoded Secrets', 'Auth Bypass', 'Path Traversal', 'Command Injection', 'Insecure Deserialization', 'SSRF', 'XSS'].map(p => (
              <span key={p} className={styles.pill}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main panel */}
      <main className={styles.main}>
        <div className={styles.panel}>
          {/* Tabs */}
          <div className={styles.tabs} role="tablist">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(id)}
                type="button"
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className={styles.tabContent}>
            {!apiKey && (
              <div className={styles.apiBanner}>
                <Key size={14} />
                <span>An Anthropic API key is required to run scans.</span>
                <button onClick={() => setShowKeyModal(true)} className={styles.bannerBtn} type="button">
                  Set key →
                </button>
              </div>
            )}
            {activeTab === 'code' && <CodeReviewTab apiKey={apiKey} />}
            {activeTab === 'diff' && <DiffReviewTab apiKey={apiKey} />}
            {activeTab === 'stream' && <StreamTab apiKey={apiKey} />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>SecureReview · No backend · API calls go directly to Anthropic</p>
        <p style={{ marginTop: 4 }}>
          by{' '}
          <a href="https://attaullah.com.pk" target="_blank" rel="noopener noreferrer">
            Hafiz Muhammad Attaullah
          </a>
        </p>
      </footer>

      {showKeyModal && (
        <ApiKeyModal
          apiKey={apiKey}
          setApiKey={setApiKey}
          onClose={() => setShowKeyModal(false)}
        />
      )}
    </div>
  )
}
