import { useState } from 'react'
import { GitPullRequest, Loader } from 'lucide-react'
import { analyzeCode } from '../utils/claude.js'
import ResultsPanel from './ResultsPanel.jsx'
import styles from './ReviewTab.module.css'

const DIFF_EXAMPLE = `diff --git a/auth/login.py b/auth/login.py
index a3f8b12..c9d2e11 100644
--- a/auth/login.py
+++ b/auth/login.py
@@ -10,9 +10,12 @@ from flask import Flask, request, jsonify
 
 def login(username, password):
-    user = db.execute('SELECT * FROM users WHERE username=?', [username])
+    user = db.execute(f'SELECT * FROM users WHERE username={username}')
     if user and check_password(password, user.password_hash):
         session['user_id'] = user.id
         return jsonify({"status": "ok"})
+    else:
+        # Debug logging
+        log.info(f'Failed login for {username} with password {password}')
     return jsonify({"error": "Invalid credentials"}), 401
 
diff --git a/utils/files.py b/utils/files.py
--- a/utils/files.py
+++ b/utils/files.py
@@ -5,5 +5,6 @@ import os
 
 def read_file(request):
     filename = request.args.get('file')
-    safe_path = os.path.join('/var/app/uploads', filename)
+    # Allow absolute paths for admin users
+    safe_path = filename if request.user.is_admin else os.path.join('/var/app/uploads', filename)
     return open(safe_path).read()`

export default function DiffReviewTab({ apiKey }) {
  const [diff, setDiff] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleScan = async () => {
    if (!diff.trim()) { setError('Please paste a diff first.'); return }
    if (!apiKey) { setError('Please set your Anthropic API key first.'); return }
    setLoading(true)
    setError('')
    setResult(null)
    setStatus('Parsing diff...')

    const ticker = setInterval(() => setStatus(s =>
      s === 'Parsing diff...' ? 'Analyzing new code only...' :
      s === 'Analyzing new code only...' ? 'Checking security implications...' :
      'Generating PR findings...'
    ), 2000)

    try {
      const res = await analyzeCode({ apiKey, code: diff, language: 'diff', context, mode: 'diff' })
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
          <input
            type="text"
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="PR context (e.g. Auth refactor, adds OAuth)..."
            className={styles.contextInput}
            style={{ width: '100%' }}
          />
        </div>
        <button className={styles.exampleBtn} onClick={() => { setDiff(DIFF_EXAMPLE); setContext('Auth and file handling refactor'); setResult(null); setError('') }}>
          Load example diff
        </button>
      </div>

      <div className={styles.diffNote}>
        <GitPullRequest size={13} />
        Only newly added lines (<code>+</code>) are analyzed. Removed lines are ignored.
      </div>

      <textarea
        className={styles.codeInput}
        value={diff}
        onChange={e => setDiff(e.target.value)}
        placeholder={`Paste your git diff or GitHub PR diff here...\n\ndiff --git a/file.py b/file.py\n--- a/file.py\n+++ b/file.py\n@@ -1,4 +1,5 @@\n-old line\n+new potentially vulnerable line`}
        spellCheck={false}
      />

      <div className={styles.actions}>
        <button className={styles.scanBtn} onClick={handleScan} disabled={loading} type="button">
          {loading ? <Loader size={16} className={styles.spin} /> : <GitPullRequest size={16} />}
          {loading ? 'Reviewing diff...' : 'Review Diff'}
        </button>
        {status && <span className={styles.status}><span className={styles.dot} />{status}</span>}
      </div>

      {error && <div className={styles.error}>{error}</div>}
      <ResultsPanel result={result} />
    </div>
  )
}
