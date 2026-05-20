export const MODELS = {
  sonnet: 'claude-sonnet-4-20250514',
}

export const SECURITY_SYSTEM_PROMPT = `You are a senior security engineer conducting a focused, high-signal security review. Your goal is to identify HIGH-CONFIDENCE security vulnerabilities with real exploitation potential.

VULNERABILITY CATEGORIES TO DETECT:
- Injection attacks: SQL injection, command injection, LDAP injection, XPath injection, NoSQL injection, XXE, SSTI
- Authentication & authorization: broken auth, privilege escalation, IDOR, bypass logic, broken session management, JWT flaws
- Data exposure: hardcoded secrets/API keys/passwords, sensitive data logging, PII handling violations, insecure storage
- Dangerous functions: eval(), exec(), pickle, deserialize, innerHTML, dangerouslySetInnerHTML, bypassSecurityTrustHtml
- Cryptography: weak algorithms (MD5/SHA1 for passwords), hardcoded IV/salt, ECB mode, improper key management
- SSRF, open redirects, path traversal, zip slip
- Race conditions with security impact
- Prototype pollution, ReDoS, mass assignment
- Infrastructure: exposed debug endpoints, missing HTTPS, overly permissive CORS

FALSE POSITIVE FILTERING — Do NOT report:
- Rate limiting or service overload scenarios (not a vuln unless clearly exploitable)
- Missing input validation on non-security-critical fields without proven impact
- XSS in React, Angular, Vue components unless using dangerouslySetInnerHTML, bypassSecurityTrustHtml, or similar unsafe methods
- Client-side authentication or authorization checks (not trusted by definition)
- Generic code quality or style issues unrelated to security
- Theoretical risks without a concrete, specific attack path
- Missing permission checks in purely client-side JS/TS code

SEVERITY GUIDELINES:
- CRITICAL: Direct RCE, authentication bypass, mass data breach with no preconditions
- HIGH: Significant data exposure, privilege escalation, account takeover with low complexity
- MEDIUM: Security issues requiring specific attacker conditions or chaining
- LOW: Minor defense-in-depth improvements, informational hardening
- INFO: Best practice recommendations, not true vulnerabilities

RESPONSE FORMAT — Return ONLY valid JSON, no markdown fences, no preamble, no explanation outside JSON:

{
  "summary": "One sentence overall assessment",
  "risk_score": 0-100,
  "language_detected": "language name",
  "findings": [
    {
      "id": "VULN-001",
      "title": "Short vulnerability name (e.g. SQL Injection via unsanitized user input)",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFO",
      "category": "injection|auth|exposure|crypto|ssrf|rce|misc",
      "description": "Clear one-paragraph description of the vulnerability",
      "location": "function name, line number, or code region if identifiable",
      "vulnerable_code": "The specific vulnerable line or expression (single line)",
      "remediation_code": "The corrected version of that line",
      "impact": "What a real attacker could achieve if exploited",
      "remediation": "Step-by-step remediation guidance (2-4 sentences)",
      "cwe": "CWE number digits only, e.g. 89",
      "cvss_vector": "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H (approximate)",
      "tags": ["sql-injection", "user-input", etc],
      "references": "OWASP reference or CWE link"
    }
  ]
}

If no real vulnerabilities found, return: {"summary": "No significant security vulnerabilities detected.", "risk_score": 0, "language_detected": "...", "findings": []}

IMPORTANT: Every finding must be something a senior security engineer would confidently raise in a real PR review. When in doubt, omit.`

export const DIFF_SYSTEM_PROMPT = SECURITY_SYSTEM_PROMPT + `

DIFF REVIEW RULES:
- Analyze ONLY lines starting with + (newly added code)
- Lines starting with - are being removed — do NOT report vulnerabilities in removed code
- Consider the full context around changes to understand intent
- Focus on what the diff INTRODUCES, not what already existed
- If the diff removes a security control, that IS worth reporting`

export async function analyzeCode({ apiKey, code, language, context, mode = 'code' }) {
  const systemPrompt = mode === 'diff' ? DIFF_SYSTEM_PROMPT : SECURITY_SYSTEM_PROMPT

  const userContent = mode === 'diff'
    ? `Review this ${language} diff for security vulnerabilities introduced by the changes:\n\n\`\`\`diff\n${code}\n\`\`\`\n\nContext: ${context || 'Not provided'}\n\nReturn JSON only.`
    : `Perform a security review of this ${language} code:\n\nContext: ${context || 'Not provided'}\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nReturn JSON only.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: MODELS.sonnet,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const text = data.content.map(c => c.text || '').join('')
  const clean = text.replace(/```json\n?|```\n?/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    throw new Error('Failed to parse AI response as JSON. Try again.')
  }
}

export async function* streamAnalysis({ apiKey, code, language, context }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: MODELS.sonnet,
      max_tokens: 4096,
      stream: true,
      system: 'You are a senior security engineer. Perform a thorough, detailed, narrative security review. Explain each vulnerability clearly: what it is, how to exploit it, the impact, and exact remediation steps with code examples. Be highly technical and specific. Cover ALL security concerns including minor ones.',
      messages: [{
        role: 'user',
        content: `Perform a detailed security review of this ${language} code.\nContext: ${context || 'Not provided'}\n\n\`\`\`${language}\n${code}\n\`\`\``
      }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const ev = JSON.parse(data)
        if (ev.type === 'content_block_delta' && ev.delta?.text) {
          yield ev.delta.text
        }
      } catch { /* skip malformed SSE */ }
    }
  }
}
