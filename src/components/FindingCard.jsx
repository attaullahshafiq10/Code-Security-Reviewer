import { useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { getSeverityConfig } from '../utils/severity.js'
import styles from './FindingCard.module.css'

export default function FindingCard({ finding, index }) {
  const [open, setOpen] = useState(index === 0)
  const cfg = getSeverityConfig(finding.severity)

  return (
    <div
      className={styles.card}
      style={{ '--sev-color': cfg.color, '--sev-bg': cfg.bg, '--sev-border': cfg.border }}
    >
      <button className={styles.header} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <div className={styles.headerLeft}>
          <span className={styles.sevBadge}>{cfg.label}</span>
          <span className={styles.id}>{finding.id}</span>
          <span className={styles.title}>{finding.title}</span>
        </div>
        <div className={styles.headerRight}>
          {finding.location && (
            <code className={styles.location}>{finding.location}</code>
          )}
          <ChevronDown
            size={16}
            className={styles.chevron}
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          />
        </div>
      </button>

      {open && (
        <div className={styles.body}>
          <p className={styles.description}>{finding.description}</p>

          {(finding.vulnerable_code || finding.remediation_code) && (
            <div className={styles.codeGrid}>
              {finding.vulnerable_code && (
                <div className={styles.codeBlock}>
                  <div className={styles.codeLabel} data-type="vuln">
                    <span>Vulnerable</span>
                  </div>
                  <pre className={styles.pre}><code className={styles.vulnLine}>- {finding.vulnerable_code}</code></pre>
                </div>
              )}
              {finding.remediation_code && (
                <div className={styles.codeBlock}>
                  <div className={styles.codeLabel} data-type="fix">
                    <span>Fixed</span>
                  </div>
                  <pre className={styles.pre}><code className={styles.fixLine}>+ {finding.remediation_code}</code></pre>
                </div>
              )}
            </div>
          )}

          <div className={styles.sections}>
            {finding.impact && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Impact</h4>
                <p className={styles.sectionText}>{finding.impact}</p>
              </div>
            )}
            {finding.remediation && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Remediation</h4>
                <p className={styles.sectionText}>{finding.remediation}</p>
              </div>
            )}
          </div>

          <div className={styles.meta}>
            {finding.cwe && (
              <a
                href={`https://cwe.mitre.org/data/definitions/${finding.cwe}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.metaTag}
              >
                CWE-{finding.cwe} <ExternalLink size={10} />
              </a>
            )}
            {(finding.tags || []).map(tag => (
              <span key={tag} className={styles.metaTag}>{tag}</span>
            ))}
            {finding.cvss_vector && (
              <span className={styles.metaTag} title={finding.cvss_vector}>CVSS</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
