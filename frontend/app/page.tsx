'use client'
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

type FileMap = { [filename: string]: string }

const BACKEND = "https://devlaunch-backend-o7j6.onrender.com"

const EXAMPLES = [
  "Next.js + FastAPI + PostgreSQL",
  "React + Node.js + MongoDB",
  "Next.js + Supabase",
  "FastAPI + Redis + Docker",
  "Vue.js + Django + MySQL",
]

const KNOWN_TECHS = ['next', 'react', 'vue', 'angular', 'fastapi', 'django', 'flask', 'node', 'express', 'postgres', 'mysql', 'mongodb', 'redis', 'docker', 'supabase', 'firebase', 'tailwind', 'typescript', 'python', 'javascript', 'graphql', 'prisma', 'trpc']

function GridBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      overflow: 'hidden', pointerEvents: 'none'
    }}>
      <div style={{
        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        width: '100%', height: '100%'
      }} />
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%'
      }} />
    </div>
  )
}

function TypingPlaceholder() {
  const [index, setIndex] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = EXAMPLES[index]
    if (!deleting && displayed.length < current.length) {
      const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 50)
      return () => clearTimeout(t)
    } else if (!deleting && displayed.length === current.length) {
      const t = setTimeout(() => setDeleting(true), 2000)
      return () => clearTimeout(t)
    } else if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30)
      return () => clearTimeout(t)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setIndex((index + 1) % EXAMPLES.length)
    }
  }, [displayed, deleting, index])

  return displayed
}

export default function Home() {
  const [stack, setStack] = useState("")
  const [scaffold, setScaffold] = useState("")
  const [files, setFiles] = useState<FileMap>({})
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [explanation, setExplanation] = useState("")
  const [explaining, setExplaining] = useState(false)
  const [githubToken, setGithubToken] = useState("")
  const [repoName, setRepoName] = useState("")
  const [creatingRepo, setCreatingRepo] = useState(false)
  const [repoUrl, setRepoUrl] = useState("")
  const [showRepoModal, setShowRepoModal] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showTokenGuide, setShowTokenGuide] = useState(false)

  const placeholder = TypingPlaceholder()

  useEffect(() => {
    const ping = setInterval(() => {
      fetch(`${BACKEND}/`).catch(() => { })
    }, 840000)
    return () => clearInterval(ping)
  }, [])

  const handleGenerate = async () => {
    if (!stack.trim()) return
    const inputLower = stack.toLowerCase()
    const hasValidTech = KNOWN_TECHS.some(tech => inputLower.includes(tech))
    if (!hasValidTech) {
      setError("Please enter a valid tech stack — e.g. 'Next.js + FastAPI + PostgreSQL'")
      return
    }
    setLoading(true)
    setError("")
    setScaffold("")
    setFiles({})
    setSelectedFile(null)
    setExplanation("")
    setRepoUrl("")

    try {
      const response = await fetch(`${BACKEND}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stack }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Something went wrong")
      setScaffold(data.scaffold)
      setFiles(data.files || {})
      if (Object.keys(data.files || {}).length > 0) {
        setSelectedFile(Object.keys(data.files)[0])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExplain = async (filename: string, content: string) => {
    setExplaining(true)
    setExplanation("")
    try {
      const response = await fetch(`${BACKEND}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, content }),
      })
      const data = await response.json()
      setExplanation(data.explanation)
    } catch {
      setExplanation("Failed to explain file.")
    } finally {
      setExplaining(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`${BACKEND}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stack }),
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "devlaunch-scaffold.zip"
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setError("Download failed.")
    } finally {
      setDownloading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreateRepo = async () => {
    if (!githubToken || !repoName) return
    setCreatingRepo(true)
    try {
      const response = await fetch(`${BACKEND}/create-repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_token: githubToken,
          repo_name: repoName,
          files: files,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail)
      setRepoUrl(data.repo_url)
      setShowRepoModal(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreatingRepo(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050507', color: 'white', fontFamily: 'system-ui, sans-serif', position: 'relative', overflowX: 'hidden' }}>
      <GridBackground />

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'relative', zIndex: 10,
          borderBottom: '1px solid #18181b',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(5,5,7,0.8)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            borderRadius: 8, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700
          }}>D</div>
          <span style={{ fontWeight: 600, fontSize: 16 }}>DevLaunch</span>
          <span style={{
            fontSize: 10, padding: '2px 8px',
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 20, color: '#a78bfa'
          }}>BETA</span>
        </div>
        <div style={{
          fontSize: 12, color: '#52525b',
          border: '1px solid #27272a',
          borderRadius: 20, padding: '4px 14px'
        }}>
          Escape setup hell. Start building.
        </div>
      </motion.nav>

      {/* HERO */}
      <AnimatePresence>
        {!scaffold && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'relative', zIndex: 10,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '80px 24px 40px'
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: 20, padding: '4px 16px',
                fontSize: 13, color: '#a78bfa', marginBottom: 24
              }}
            >
              ✦ AI-powered project scaffolding
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 'clamp(28px, 5vw, 56px)',
                fontWeight: 700, textAlign: 'center',
                lineHeight: 1.15, marginBottom: 16, margin: '0 0 16px'
              }}
            >
              Stop wasting hours on setup.
              <br />
              <span style={{ color: '#8b5cf6' }}>Start building instantly.</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                color: '#71717a', textAlign: 'center',
                fontSize: 17, maxWidth: 500,
                margin: '16px 0 40px', lineHeight: 1.6
              }}
            >
              Type your tech stack. DevLaunch generates every file, every config, every folder — production ready in seconds.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ width: '100%', maxWidth: 580 }}
            >
              <div style={{
                background: 'rgba(139,92,246,0.05)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 16, padding: 6,
              }}>
                <input
                  type="text"
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder={placeholder || "e.g. FastAPI + React + PostgreSQL"}
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', outline: 'none',
                    padding: '14px 16px', fontSize: 16,
                    color: 'white', boxSizing: 'border-box'
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleGenerate}
                  disabled={!stack.trim()}
                  style={{
                    width: '100%', marginTop: 4,
                    background: stack.trim()
                      ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                      : '#1c1c1f',
                    border: 'none', borderRadius: 12,
                    padding: '14px 20px', fontSize: 15,
                    fontWeight: 600, color: stack.trim() ? 'white' : '#52525b',
                    cursor: stack.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', boxSizing: 'border-box'
                  }}
                >
                  Generate Scaffold →
                </motion.button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                {EXAMPLES.map((ex) => (
                  <motion.button
                    key={ex}
                    whileHover={{ scale: 1.03, borderColor: '#7c3aed' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStack(ex)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid #27272a',
                      borderRadius: 20, padding: '6px 14px',
                      fontSize: 12, color: '#71717a',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {ex}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12, marginTop: 60,
                width: '100%', maxWidth: 680
              }}
            >
              {[
                { icon: '⚡', title: 'Instant Generation', desc: 'Full scaffold in 15 seconds' },
                { icon: '📁', title: 'File Tree View', desc: 'Browse every generated file' },
                { icon: '🤖', title: 'AI Explanations', desc: 'Understand any file instantly' },
                { icon: '🚀', title: 'Push to GitHub', desc: 'One click repo creation' },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ y: -4, borderColor: 'rgba(139,92,246,0.3)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid #18181b',
                    borderRadius: 12, padding: 16,
                    textAlign: 'center', cursor: 'default',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#52525b' }}>{f.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'relative', zIndex: 10,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '120px 24px'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 48, height: 48,
                border: '2px solid #18181b',
                borderTopColor: '#7c3aed',
                borderRightColor: '#4f46e5',
                borderRadius: '50%', marginBottom: 24
              }}
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}
            >
              Generating your scaffold...
            </motion.div>
            <div style={{ color: '#52525b', fontSize: 14 }}>Claude is building your complete project</div>
            <div style={{ color: '#3f3f46', fontSize: 12, marginTop: 4 }}>This takes about 15-20 seconds</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'relative', zIndex: 10,
              maxWidth: 580, margin: '16px auto',
              padding: '0 24px'
            }}
          >
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12, padding: '12px 16px',
              color: '#f87171', fontSize: 14,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>{error}</span>
              <button onClick={() => setError("")} style={{
                color: '#f87171', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 18, marginLeft: 12
              }}>×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULT */}
      <AnimatePresence>
        {scaffold && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'relative', zIndex: 10,
              display: 'flex', flexDirection: 'column',
              height: 'calc(100vh - 65px)'
            }}
          >
            {/* TOP BAR */}
            <div style={{
              borderBottom: '1px solid #18181b',
              padding: '10px 20px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(5,5,7,0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => { setScaffold(""); setFiles({}); setStack(""); setError("") }}
                  style={{
                    color: '#52525b', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 13
                  }}
                >
                  ← New scaffold
                </button>
                <span style={{ color: '#27272a' }}>|</span>
                <span style={{
                  fontSize: 12, color: '#a1a1aa',
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: 6, padding: '2px 10px'
                }}>{stack}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  disabled={downloading}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid #27272a',
                    borderRadius: 8, padding: '7px 14px',
                    fontSize: 13, color: '#a1a1aa',
                    cursor: 'pointer'
                  }}
                >
                  {downloading ? "Downloading..." : "⬇ Download ZIP"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRepoModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    border: 'none', borderRadius: 8,
                    padding: '7px 14px', fontSize: 13,
                    fontWeight: 600, color: 'white', cursor: 'pointer'
                  }}
                >
                  🚀 Push to GitHub
                </motion.button>
              </div>
            </div>

            {/* REPO SUCCESS */}
            <AnimatePresence>
              {repoUrl && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    background: 'rgba(34,197,94,0.08)',
                    borderBottom: '1px solid rgba(34,197,94,0.2)',
                    padding: '10px 20px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', fontSize: 13
                  }}
                >
                  <span style={{ color: '#86efac' }}>✓ Repository created successfully!</span>
                  <a href={repoUrl} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#4ade80', textDecoration: 'underline' }}>
                    View on GitHub →
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN CONTENT */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

              {/* FILE TREE */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  width: 220, borderRight: '1px solid #18181b',
                  overflowY: 'auto', paddingTop: 12,
                  background: 'rgba(5,5,7,0.5)', flexShrink: 0
                }}
              >
                <div style={{
                  padding: '0 16px 8px',
                  fontSize: 10, color: '#3f3f46',
                  textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>
                  Files ({Object.keys(files).length})
                </div>
                {Object.keys(files).map((filename, i) => (
                  <motion.button
                    key={filename}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => { setSelectedFile(filename); setExplanation("") }}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '8px 16px', fontSize: 12,
                      background: selectedFile === filename ? 'rgba(139,92,246,0.1)' : 'transparent',
                      borderLeft: selectedFile === filename ? '2px solid #7c3aed' : '2px solid transparent',
                      borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                      color: selectedFile === filename ? '#a78bfa' : '#71717a',
                      cursor: 'pointer', transition: 'all 0.15s',
                      fontFamily: 'monospace'
                    }}
                  >
                    {filename}
                  </motion.button>
                ))}
              </motion.div>

              {/* CODE VIEW */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {selectedFile && files[selectedFile] && (
                  <motion.div
                    key={selectedFile}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                  >
                    <div style={{
                      borderBottom: '1px solid #18181b',
                      padding: '10px 20px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(5,5,7,0.8)', flexShrink: 0
                    }}>
                      <span style={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'monospace' }}>
                        📄 {selectedFile}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopy(files[selectedFile])}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid #27272a',
                            borderRadius: 6, padding: '5px 12px',
                            fontSize: 12, color: copied ? '#4ade80' : '#71717a',
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {copied ? '✓ Copied' : 'Copy'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExplain(selectedFile, files[selectedFile])}
                          style={{
                            background: 'rgba(139,92,246,0.1)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            borderRadius: 6, padding: '5px 12px',
                            fontSize: 12, color: '#a78bfa',
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {explaining ? '⏳ Explaining...' : '✨ Explain this file'}
                        </motion.button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {explanation && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{
                            background: 'rgba(139,92,246,0.05)',
                            borderBottom: '1px solid rgba(139,92,246,0.15)',
                            padding: '16px 20px', flexShrink: 0
                          }}
                        >
                          <div style={{
                            fontSize: 11, color: '#7c3aed',
                            fontWeight: 600, marginBottom: 10,
                            textTransform: 'uppercase', letterSpacing: '0.08em'
                          }}>
                            ✨ AI Explanation
                          </div>
                          <pre style={{
                            fontSize: 13, color: '#c4b5fd',
                            lineHeight: 1.7, whiteSpace: 'pre-wrap',
                            fontFamily: 'system-ui, sans-serif', margin: 0
                          }}>
                            {explanation}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <pre style={{
                      flex: 1, padding: 20,
                      fontSize: 13, color: '#a1a1aa',
                      fontFamily: 'monospace', overflowX: 'auto',
                      whiteSpace: 'pre-wrap', lineHeight: 1.6,
                      background: 'transparent', margin: 0
                    }}>
                      {files[selectedFile]}
                    </pre>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GITHUB MODAL */}
      <AnimatePresence>
        {showRepoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 50,
              padding: 24, backdropFilter: 'blur(4px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{
                background: '#0c0c0f',
                border: '1px solid #27272a',
                borderRadius: 16, padding: 24,
                width: '100%', maxWidth: 460
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                🚀 Push to GitHub
              </div>
              <div style={{ fontSize: 13, color: '#71717a', marginBottom: 20 }}>
                Create a new GitHub repo with all scaffold files pushed automatically.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#52525b', display: 'block', marginBottom: 6 }}>
                    REPOSITORY NAME
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-awesome-project"
                    style={{
                      width: '100%', background: '#18181b',
                      border: '1px solid #27272a', borderRadius: 8,
                      padding: '10px 14px', color: 'white',
                      fontSize: 14, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, color: '#52525b' }}>
                      GITHUB PERSONAL ACCESS TOKEN
                    </label>
                    <button
                      onClick={() => setShowTokenGuide(!showTokenGuide)}
                      style={{
                        fontSize: 11, color: '#7c3aed',
                        background: 'none', border: 'none',
                        cursor: 'pointer', textDecoration: 'underline'
                      }}
                    >
                      {showTokenGuide ? 'Hide guide' : 'How to get token?'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showTokenGuide && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{
                          background: 'rgba(139,92,246,0.05)',
                          border: '1px solid rgba(139,92,246,0.15)',
                          borderRadius: 8, padding: '12px 14px',
                          marginBottom: 8, fontSize: 12,
                          color: '#a1a1aa', lineHeight: 1.8,
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Step by step:</div>
                        <div>1. Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed' }}>github.com/settings/tokens</a></div>
                        <div>2. Click <strong style={{ color: '#e4e4e7' }}>"Generate new token (classic)"</strong></div>
                        <div>3. Add note: <strong style={{ color: '#e4e4e7' }}>"DevLaunch"</strong></div>
                        <div>4. Set expiration: <strong style={{ color: '#e4e4e7' }}>90 days</strong></div>
                        <div>5. Check <strong style={{ color: '#e4e4e7' }}>"repo"</strong> scope only</div>
                        <div>6. Click <strong style={{ color: '#e4e4e7' }}>"Generate token"</strong></div>
                        <div>7. Copy token starting with <strong style={{ color: '#e4e4e7' }}>ghp_</strong></div>
                        <div style={{ marginTop: 8, color: '#52525b', fontSize: 11 }}>
                          🔒 We never store your token.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    style={{
                      width: '100%', background: '#18181b',
                      border: '1px solid #27272a', borderRadius: 8,
                      padding: '10px 14px', color: 'white',
                      fontSize: 14, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => setShowRepoModal(false)}
                  style={{
                    flex: 1, background: '#18181b',
                    border: '1px solid #27272a', borderRadius: 8,
                    padding: 11, fontSize: 13,
                    color: '#71717a', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateRepo}
                  disabled={creatingRepo || !githubToken || !repoName}
                  style={{
                    flex: 1,
                    background: creatingRepo || !githubToken || !repoName
                      ? '#27272a'
                      : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    border: 'none', borderRadius: 8,
                    padding: 11, fontSize: 13,
                    fontWeight: 600, color: 'white',
                    cursor: creatingRepo || !githubToken || !repoName ? 'not-allowed' : 'pointer'
                  }}
                >
                  {creatingRepo ? "Creating..." : "Create & Push →"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}