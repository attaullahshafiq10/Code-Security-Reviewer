export const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

export const SEVERITY_CONFIG = {
  CRITICAL: {
    label: 'Critical',
    color: 'var(--critical)',
    bg: 'var(--critical-bg)',
    border: 'var(--critical-border)',
    icon: '⬡',
  },
  HIGH: {
    label: 'High',
    color: 'var(--high)',
    bg: 'var(--high-bg)',
    border: 'var(--high-border)',
    icon: '▲',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'var(--medium)',
    bg: 'var(--medium-bg)',
    border: 'var(--medium-border)',
    icon: '◆',
  },
  LOW: {
    label: 'Low',
    color: 'var(--low)',
    bg: 'var(--low-bg)',
    border: 'var(--low-border)',
    icon: '●',
  },
  INFO: {
    label: 'Info',
    color: 'var(--info)',
    bg: 'var(--info-bg)',
    border: 'var(--info-border)',
    icon: '◉',
  },
}

export function getSeverityConfig(severity) {
  return SEVERITY_CONFIG[(severity || 'INFO').toUpperCase()] || SEVERITY_CONFIG.INFO
}

export function getRiskLabel(score) {
  if (score >= 80) return { label: 'Critical Risk', color: 'var(--critical)' }
  if (score >= 60) return { label: 'High Risk', color: 'var(--high)' }
  if (score >= 40) return { label: 'Medium Risk', color: 'var(--medium)' }
  if (score >= 20) return { label: 'Low Risk', color: 'var(--low)' }
  return { label: 'Minimal Risk', color: 'var(--success)' }
}

export function countBySeverity(findings = []) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
  findings.forEach(f => {
    const s = (f.severity || 'INFO').toUpperCase()
    if (counts[s] !== undefined) counts[s]++
  })
  return counts
}

export const CATEGORY_LABELS = {
  injection: 'Injection',
  auth: 'Auth & Access',
  exposure: 'Data Exposure',
  crypto: 'Cryptography',
  ssrf: 'SSRF',
  rce: 'Remote Code Exec',
  misc: 'Miscellaneous',
}

export const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'c', label: 'C / C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'shell', label: 'Shell / Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'yaml', label: 'YAML / Config' },
  { value: 'terraform', label: 'Terraform' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
]

export const EXAMPLE_CODE = {
  python: `# Example with multiple vulnerabilities
import subprocess
import sqlite3
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
SECRET_KEY = "hardcoded_secret_123"  # Hardcoded secret

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    
    # SQL Injection vulnerability
    conn = sqlite3.connect('users.db')
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    user = conn.execute(query).fetchone()
    
    if user:
        return jsonify({"token": SECRET_KEY + username})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/run', methods=['POST'])
def run_command():
    cmd = request.json.get('command')
    # Command injection vulnerability
    result = subprocess.run(cmd, shell=True, capture_output=True)
    return jsonify({"output": result.stdout.decode()})`,

  javascript: `const express = require('express');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',  // Hardcoded credentials
  database: 'myapp'
});

// SQL Injection via string concatenation
app.get('/user', (req, res) => {
  const id = req.query.id;
  db.query('SELECT * FROM users WHERE id = ' + id, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// XSS via innerHTML
app.get('/search', (req, res) => {
  res.send(\`<div id="results"></div>
  <script>
    document.getElementById('results').innerHTML = '\${req.query.q}';
  </script>\`);
});

// Path traversal
app.get('/file', (req, res) => {
  const filename = req.query.name;
  res.sendFile('/var/app/files/' + filename);
});`,
}
