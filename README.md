# SecureReview — Code Security Reviewer

An AI-powered code security reviewer built on Claude Sonnet. Detects real vulnerabilities with deep semantic understanding — not just pattern matching.

## Features

- **AI-Powered Analysis** — Claude's reasoning finds vulnerabilities that regex can't
- **Code Review** — paste any code snippet, choose language, pick check categories
- **Diff / PR Review** — analyzes only added lines (`+`), ignores removed code
- **Raw Stream** — full narrative analysis streamed token-by-token
- **False-Positive Filtering** — senior security engineer prompt: no noise
- **Language Agnostic** — Python, JS/TS, Java, Go, Rust, PHP, Ruby, C/C++, SQL, Shell, YAML, Terraform, Dockerfile, and more
- **CVSS + CWE** — every finding includes severity, CWE reference, and CVSS vector
- **No backend** — all API calls go directly from your browser to Anthropic

## Vulnerability Coverage

- Injection: SQL, command, LDAP, XPath, NoSQL, XXE, SSTI
- Auth & Authorization: broken auth, privilege escalation, IDOR, JWT flaws, session management
- Data Exposure: hardcoded secrets/keys, sensitive logging, PII violations
- Dangerous Functions: `eval()`, `exec()`, `pickle`, `innerHTML`, `dangerouslySetInnerHTML`
- Cryptography: weak algorithms, hardcoded IV/salt, ECB mode, key mismanagement
- SSRF, open redirects, path traversal, zip slip
- Race conditions, prototype pollution, mass assignment

## Getting Started
https://codesecurity.vercel.app/


---

## Project Structure

```
securereview/
├── public/
│   └── shield.svg              # Favicon
├── src/
│   ├── components/
│   │   ├── ApiKeyModal.jsx      # API key input modal
│   │   ├── CodeReviewTab.jsx    # Code review tab
│   │   ├── DiffReviewTab.jsx    # Git diff review tab
│   │   ├── StreamTab.jsx        # Raw streaming analysis
│   │   ├── FindingCard.jsx      # Individual vulnerability card
│   │   └── ResultsPanel.jsx     # Results summary + filter
│   ├── hooks/
│   │   └── useApiKey.js         # API key localStorage hook
│   ├── utils/
│   │   ├── claude.js            # Anthropic API calls + prompts
│   │   └── severity.js          # Severity config + helpers
│   ├── App.jsx
│   ├── App.module.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── netlify.toml                 # Netlify deployment config
├── vercel.json                  # Vercel deployment config
└── package.json
```

## Customizing the Security Prompt

The system prompt lives in `src/utils/claude.js`. Customize `SECURITY_SYSTEM_PROMPT` to add:
- Organization-specific rules
- Framework-specific checks
- Custom false-positive exclusions
- Additional vulnerability categories

## Tech Stack

- **React 18** + Vite
- **Claude Sonnet** via Anthropic API
- **CSS Modules** — no CSS framework dependencies
- **Lucide React** for icons
- Zero runtime dependencies beyond React + lucide

## License

MIT
