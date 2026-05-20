import { useState } from 'react'
import { ShieldCheck, AlertOctagon } from 'lucide-react'
import FindingCard from './FindingCard.jsx'
import { SEVERITY_ORDER, countBySeverity, getSeverityConfig, getRiskLabel } from '../utils/severity.js'
import styles from './ResultsPanel.module.css'

export default function ResultsPanel({ result }) {
  const [filter, setFilter] = useState('all')

  if (!result) return null

  const { findings = [], summary, risk_score, language_detected } = result
  const counts = countBySeverity(findings)
  const visibleFindings = filter === 'all' ? findings : findings.filter(f => (f.severity || 'INFO').toUpperCase() === filter)
  const riskLabel = getRiskLabel(risk_score || 0)
  const sortedFindings = [...visibleFindings].sort((a, b) =>
    SEVERITY_ORDER.indexOf((a.severity||'INFO').toUpperCase()) - SEVERITY_ORDER.indexOf((b.severity||'INFO').toUpperCase())
  )

  if (findings.length === 0) {
    return (
      <div className={styles.clean}>
        <ShieldCheck size={32} className={styles.cleanIcon} />
        <div>
          <strong>No vulnerabilities detected</strong>
          <p>The code passed the security review with no high-confidence findings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.summaryBar}>
        <div className={styles.riskScore}>
          <div
            className={styles.scoreCircle}
            style={{ '--score-color': riskLabel.color }}
          >
            <span className={styles.scoreNum}>{risk_score}</span>
            <span className={styles.scoreMax}>/100</span>
          </div>
          <div>
            <div className={styles.riskLabel} style={{ color: riskLabel.color }}>{riskLabel.label}</div>
            {language_detected && <div className={styles.langTag}>{language_detected}</div>}
          </div>
        </div>

        <div className={styles.sevCounts}>
          {SEVERITY_ORDER.map(sev => {
            const cfg = getSeverityConfig(sev)
            const count = counts[sev]
            if (!count) return null
            return (
              <div key={sev} className={styles.sevCount} style={{ '--sev-color': cfg.color, '--sev-bg': cfg.bg }}>
                <span className={styles.sevNum}>{count}</span>
                <span className={styles.sevName}>{cfg.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {summary && (
        <p className={styles.summary}>
          <AlertOctagon size={13} style={{ flexShrink: 0, marginTop: 2 }} />
          {summary}
        </p>
      )}

      <div className={styles.filterRow}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({findings.length})
        </button>
        {SEVERITY_ORDER.map(sev => {
          if (!counts[sev]) return null
          const cfg = getSeverityConfig(sev)
          return (
            <button
              key={sev}
              className={`${styles.filterBtn} ${filter === sev ? styles.active : ''}`}
              onClick={() => setFilter(sev)}
              style={filter === sev ? { '--active-color': cfg.color, '--active-bg': cfg.bg } : {}}
            >
              {cfg.label} ({counts[sev]})
            </button>
          )
        })}
      </div>

      <div className={styles.findings}>
        {sortedFindings.map((f, i) => (
          <FindingCard key={f.id || i} finding={f} index={i} />
        ))}
      </div>
    </div>
  )
}
