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
  "React + Express + PostgreSQL",
  "Next.js + Prisma + PostgreSQL",
  "FastAPI + SQLAlchemy + Redis",
]

const KNOWN_TECHS = ['next', 'react', 'vue', 'angular', 'fastapi', 'django', 'flask', 'node', 'express', 'postgres', 'mysql', 'mongodb', 'redis', 'docker', 'supabase', 'firebase', 'tailwind', 'typescript', 'python', 'javascript', 'graphql', 'prisma', 'trpc', 'svelte', 'nuxt', 'laravel', 'rails', 'spring', 'kotlin', 'golang', 'rust', 'sqlite', 'cassandra', 'elasticsearch']

function Particles() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    width: (((i * 7) % 4) + 2) + 'px',
    height: (((i * 11) % 4) + 2) + 'px',
    opacity: ((i * 13) % 5) / 10 + 0.1,
    left: ((i * 17) % 100) + '%',
    duration: ((i * 7) % 15 + 10) + 's',
    delay: ((i * 3) % 10) + 's',
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: p.width,
            height: p.height,
            background: `rgba(22, 163, 74, ${p.opacity})`,
            borderRadius: '50%',
            left: p.left,
            animation: `particle-float ${p.duration} linear infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

function TypingText() {
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
  const [focused, setFocused] = useState(false)

  const placeholder = TypingText()

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
    <main style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif', position: 'relative', overflowX: 'hidden' }}>

      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>
      <div className="grid-bg" />
      <Particles />

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'relative', zIndex: 10,
          borderBottom: '1px solid #21262d',
          padding: '14px 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(13,17,23,0.85)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800,
              boxShadow: '0 0 20px rgba(22,163,74,0.4)'
            }}
          >D</motion.div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>DevLaunch</span>
          <span style={{
            fontSize: 10, padding: '2px 8px',
            background: 'rgba(22,163,74,0.1)',
            border: '1px solid rgba(22,163,74,0.3)',
            borderRadius: 20, color: '#4ade80',
            fontWeight: 600, letterSpacing: '0.05em'
          }}>BETA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, color: '#8b949e' }}>
            Escape setup hell. Start building.
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 10px #22c55e'
            }}
          />
        </div>
      </motion.nav>

      {/* HERO */}
      <AnimatePresence>
        {!scaffold && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'relative', zIndex: 10,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '60px 24px 40px',
            }}
          >
            {/* Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                background: 'rgba(22,163,74,0.08)',
                border: '1px solid rgba(22,163,74,0.3)',
                borderRadius: 20, padding: '5px 16px',
                fontSize: 12, color: '#4ade80',
                marginBottom: 24, display: 'flex',
                alignItems: 'center', gap: 8
              }}
            >
              <motion.span animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity }}>⚡</motion.span>
              AI-powered project scaffolding — Generate in seconds
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 'clamp(28px, 5vw, 58px)',
                fontWeight: 800, textAlign: 'center',
                lineHeight: 1.1, marginBottom: 16,
                letterSpacing: '-0.03em'
              }}
            >
              Stop wasting hours
              <br />
              <span className="shimmer-text">on project setup.</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                color: '#8b949e', textAlign: 'center',
                fontSize: 17, maxWidth: 500,
                marginBottom: 40, lineHeight: 1.7
              }}
            >
              Type your tech stack. Get every file, every config, every folder —
              <span style={{ color: '#4ade80' }}> production ready instantly.</span>
            </motion.p>

            {/* INPUT */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              style={{ width: '100%', maxWidth: 600, marginBottom: 48 }}
            >
              <div
                className="input-glow"
                style={{
                  background: '#161b22',
                  border: `1px solid ${focused ? 'rgba(22,163,74,0.6)' : '#21262d'}`,
                  borderRadius: 16, padding: 6,
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px 4px' }}>
                  <span style={{ fontSize: 18, marginRight: 10 }}>⚡</span>
                  <input
                    type="text"
                    value={stack}
                    onChange={(e) => setStack(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder || "e.g. FastAPI + React + PostgreSQL"}
                    style={{
                      flex: 1, background: 'transparent',
                      border: 'none', outline: 'none',
                      fontSize: 16, color: '#e6edf3',
                      fontWeight: 500
                    }}
                  />
                  {stack && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => setStack("")}
                      style={{
                        background: 'none', border: 'none',
                        color: '#8b949e', cursor: 'pointer', fontSize: 18
                      }}
                    >×</motion.button>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleGenerate}
                  disabled={!stack.trim()}
                  className={stack.trim() ? 'glow-button' : ''}
                  style={{
                    width: '100%', marginTop: 6,
                    background: stack.trim()
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : '#21262d',
                    border: 'none', borderRadius: 12,
                    padding: '14px 20px', fontSize: 15,
                    fontWeight: 700,
                    color: stack.trim() ? 'white' : '#8b949e',
                    cursor: stack.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s',
                    boxSizing: 'border-box'
                  }}
                >
                  {stack.trim() ? '⚡ Generate Scaffold →' : 'Type your stack above...'}
                </motion.button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: '#8b949e', alignSelf: 'center' }}>Try:</span>
                {EXAMPLES.slice(0, 5).map((ex) => (
                  <motion.button
                    key={ex}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStack(ex)}
                    style={{
                      background: '#161b22',
                      border: '1px solid #21262d',
                      borderRadius: 20, padding: '5px 14px',
                      fontSize: 12, color: '#8b949e',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {ex}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* BENTO GRID */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                width: '100%', maxWidth: 900,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'auto auto',
                gap: 12,
              }}
            >
              {/* BIG CARD */}
              <motion.div
                whileHover={{ y: -4, borderColor: 'rgba(22,163,74,0.4)' }}
                className="bento-card"
                style={{
                  gridColumn: 'span 2',
                  gridRow: 'span 2',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 200
                }}
              >
                <div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>
                    Instant Scaffold Generation
                  </div>
                  <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.6 }}>
                    Type any tech stack combination. Claude AI generates a complete, production-ready project scaffold in under 20 seconds. Every file. Every config. Ready to build.
                  </div>
                </div>
                <div style={{
                  marginTop: 16, fontSize: 12,
                  color: '#4ade80',
                  background: 'rgba(22,163,74,0.08)',
                  border: '1px solid rgba(22,163,74,0.2)',
                  borderRadius: 8, padding: '6px 12px',
                  display: 'inline-block'
                }}>
                  Powered by Claude Opus ✦
                </div>
              </motion.div>

              {/* SMALL CARDS */}
              {[
                { icon: '📁', title: 'File Tree View', desc: 'Browse every generated file interactively' },
                { icon: '🤖', title: 'AI Explanations', desc: 'Click any file — Claude explains it instantly' },
                { icon: '⬇️', title: 'Download ZIP', desc: 'Get actual files on your machine' },
                { icon: '🚀', title: 'Push to GitHub', desc: 'Auto-create repo with all files pushed' },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ y: -4, borderColor: 'rgba(22,163,74,0.4)' }}
                  className="bento-card"
                >
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.5 }}>{f.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* STATS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{
                display: 'flex', gap: 32, marginTop: 32,
                padding: '14px 32px',
                background: '#161b22',
                border: '1px solid #21262d',
                borderRadius: 12,
              }}
            >
              {[
                { num: '20+', label: 'Frameworks supported' },
                { num: '< 20s', label: 'Generation time' },
                { num: '4', label: 'Power features' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#4ade80' }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: '#8b949e', marginTop: 2 }}>{s.label}</div>
                </div>
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
              minHeight: 'calc(100vh - 67px)', padding: '24px'
            }}
          >
            <div style={{ position: 'relative', marginBottom: 32 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 64, height: 64,
                  border: '2px solid rgba(22,163,74,0.2)',
                  borderTopColor: '#16a34a',
                  borderRightColor: '#4ade80',
                  borderRadius: '50%'
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 24
              }}>⚡</div>
            </div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}
            >
              Building your scaffold...
            </motion.div>
            <div style={{ color: '#8b949e', fontSize: 14, marginBottom: 4 }}>
              Claude is generating your complete project
            </div>
            <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 24 }}>
              This takes about 15-20 seconds
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Analyzing stack', 'Generating files', 'Writing configs', 'Finalizing'].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  style={{
                    fontSize: 11, color: '#4ade80',
                    background: 'rgba(22,163,74,0.08)',
                    border: '1px solid rgba(22,163,74,0.2)',
                    borderRadius: 20, padding: '4px 12px'
                  }}
                >
                  {step}
                </motion.div>
              ))}
            </div>
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
              maxWidth: 580, margin: '16px auto', padding: '0 24px'
            }}
          >
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12, padding: '12px 16px',
              color: '#f87171', fontSize: 14,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>⚠️ {error}</span>
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
              height: 'calc(100vh - 67px)'
            }}
          >
            {/* TOP BAR */}
            <div style={{
              borderBottom: '1px solid #21262d',
              padding: '10px 20px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(13,17,23,0.95)',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <motion.button
                  whileHover={{ x: -3 }}
                  onClick={() => { setScaffold(""); setFiles({}); setStack(""); setError("") }}
                  style={{
                    color: '#8b949e', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 13
                  }}
                >
                  ← New scaffold
                </motion.button>
                <span style={{ color: '#21262d' }}>|</span>
                <span style={{
                  fontSize: 12, color: '#4ade80',
                  background: 'rgba(22,163,74,0.08)',
                  border: '1px solid rgba(22,163,74,0.2)',
                  borderRadius: 6, padding: '3px 10px', fontWeight: 500
                }}>⚡ {stack}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  disabled={downloading}
                  style={{
                    background: '#161b22',
                    border: '1px solid #21262d',
                    borderRadius: 8, padding: '7px 14px',
                    fontSize: 13, color: '#8b949e',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {downloading ? "⏳ Downloading..." : "⬇ Download ZIP"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRepoModal(true)}
                  className="glow-button"
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    border: 'none', borderRadius: 8,
                    padding: '7px 16px', fontSize: 13,
                    fontWeight: 700, color: 'white', cursor: 'pointer'
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
                    background: 'rgba(22,163,74,0.06)',
                    borderBottom: '1px solid rgba(22,163,74,0.15)',
                    padding: '10px 20px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', fontSize: 13
                  }}
                >
                  <span style={{ color: '#4ade80' }}>✓ Repository created successfully!</span>
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
                  width: 230,
                  borderRight: '1px solid #21262d',
                  overflowY: 'auto', paddingTop: 16,
                  background: '#0d1117', flexShrink: 0
                }}
              >
                <div style={{
                  padding: '0 16px 10px',
                  fontSize: 10, color: '#8b949e',
                  textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600
                }}>
                  📁 Files ({Object.keys(files).length})
                </div>
                {Object.keys(files).map((filename, i) => (
                  <motion.button
                    key={filename}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ x: 4 }}
                    onClick={() => { setSelectedFile(filename); setExplanation("") }}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '9px 16px', fontSize: 12,
                      background: selectedFile === filename ? 'rgba(22,163,74,0.08)' : 'transparent',
                      borderLeft: selectedFile === filename ? '2px solid #16a34a' : '2px solid transparent',
                      borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                      color: selectedFile === filename ? '#4ade80' : '#8b949e',
                      cursor: 'pointer', transition: 'all 0.15s',
                      fontFamily: 'monospace',
                      fontWeight: selectedFile === filename ? 600 : 400
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
                      borderBottom: '1px solid #21262d',
                      padding: '10px 20px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#0d1117', flexShrink: 0
                    }}>
                      <span style={{ fontSize: 13, color: '#8b949e', fontFamily: 'monospace', fontWeight: 500 }}>
                        📄 {selectedFile}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopy(files[selectedFile])}
                          style={{
                            background: copied ? 'rgba(22,163,74,0.1)' : '#161b22',
                            border: `1px solid ${copied ? 'rgba(22,163,74,0.3)' : '#21262d'}`,
                            borderRadius: 6, padding: '5px 12px',
                            fontSize: 12, color: copied ? '#4ade80' : '#8b949e',
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {copied ? '✓ Copied!' : '📋 Copy'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExplain(selectedFile, files[selectedFile])}
                          style={{
                            background: 'rgba(22,163,74,0.06)',
                            border: '1px solid rgba(22,163,74,0.2)',
                            borderRadius: 6, padding: '5px 12px',
                            fontSize: 12, color: '#4ade80',
                            cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500
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
                            background: 'rgba(22,163,74,0.04)',
                            borderBottom: '1px solid rgba(22,163,74,0.1)',
                            padding: '16px 20px', flexShrink: 0
                          }}
                        >
                          <div style={{
                            fontSize: 10, color: '#16a34a',
                            fontWeight: 700, marginBottom: 10,
                            textTransform: 'uppercase', letterSpacing: '0.1em'
                          }}>
                            ✨ AI Explanation
                          </div>
                          <pre style={{
                            fontSize: 13, color: '#4ade80',
                            lineHeight: 1.8, whiteSpace: 'pre-wrap',
                            fontFamily: 'system-ui, sans-serif', margin: 0,
                            opacity: 0.9
                          }}>
                            {explanation}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <pre style={{
                      flex: 1, padding: 24,
                      fontSize: 13, color: '#8b949e',
                      fontFamily: '"Fira Code", monospace',
                      overflowX: 'auto', whiteSpace: 'pre-wrap',
                      lineHeight: 1.7, background: 'transparent', margin: 0
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
              background: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 50,
              padding: 24, backdropFilter: 'blur(8px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              style={{
                background: '#161b22',
                border: '1px solid #21262d',
                borderRadius: 20, padding: 28,
                width: '100%', maxWidth: 460,
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.02em' }}>
                🚀 Push to GitHub
              </div>
              <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 24, lineHeight: 1.5 }}>
                Create a new repository with all scaffold files pushed automatically.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{
                    fontSize: 11, color: '#8b949e', display: 'block',
                    marginBottom: 8, textTransform: 'uppercase',
                    letterSpacing: '0.08em', fontWeight: 600
                  }}>Repository Name</label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-awesome-project"
                    style={{
                      width: '100%', background: '#0d1117',
                      border: '1px solid #21262d', borderRadius: 10,
                      padding: '12px 16px', color: '#e6edf3',
                      fontSize: 14, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{
                      fontSize: 11, color: '#8b949e',
                      textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600
                    }}>GitHub Token</label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowTokenGuide(!showTokenGuide)}
                      style={{
                        fontSize: 11, color: '#4ade80',
                        background: 'none', border: 'none',
                        cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      {showTokenGuide ? '▲ Hide guide' : '▼ How to get token?'}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showTokenGuide && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{
                          background: 'rgba(22,163,74,0.04)',
                          border: '1px solid rgba(22,163,74,0.15)',
                          borderRadius: 10, padding: '14px 16px',
                          marginBottom: 10, fontSize: 12,
                          color: '#8b949e', lineHeight: 2, overflow: 'hidden'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#4ade80', marginBottom: 6 }}>Step by step:</div>
                        <div>1. Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80' }}>github.com/settings/tokens</a></div>
                        <div>2. Click <strong style={{ color: '#e6edf3' }}>"Generate new token (classic)"</strong></div>
                        <div>3. Add note: <strong style={{ color: '#e6edf3' }}>"DevLaunch"</strong></div>
                        <div>4. Expiration: <strong style={{ color: '#e6edf3' }}>90 days</strong></div>
                        <div>5. Check <strong style={{ color: '#e6edf3' }}>"repo"</strong> scope only</div>
                        <div>6. Click <strong style={{ color: '#e6edf3' }}>"Generate token"</strong></div>
                        <div>7. Copy token starting with <strong style={{ color: '#e6edf3' }}>ghp_</strong></div>
                        <div style={{ marginTop: 8, color: '#8b949e', fontSize: 11 }}>🔒 We never store your token.</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    style={{
                      width: '100%', background: '#0d1117',
                      border: '1px solid #21262d', borderRadius: 10,
                      padding: '12px 16px', color: '#e6edf3',
                      fontSize: 14, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRepoModal(false)}
                  style={{
                    flex: 1, background: '#21262d',
                    border: '1px solid #21262d', borderRadius: 10,
                    padding: 13, fontSize: 13,
                    color: '#8b949e', cursor: 'pointer'
                  }}
                >Cancel</motion.button>
                <motion.button
                  whileHover={{ scale: creatingRepo || !githubToken || !repoName ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateRepo}
                  disabled={creatingRepo || !githubToken || !repoName}
                  style={{
                    flex: 2,
                    background: creatingRepo || !githubToken || !repoName
                      ? '#21262d'
                      : 'linear-gradient(135deg, #16a34a, #15803d)',
                    border: 'none', borderRadius: 10,
                    padding: 13, fontSize: 13,
                    fontWeight: 700,
                    color: creatingRepo || !githubToken || !repoName ? '#8b949e' : 'white',
                    cursor: creatingRepo || !githubToken || !repoName ? 'not-allowed' : 'pointer',
                    boxShadow: creatingRepo || !githubToken || !repoName ? 'none' : '0 0 20px rgba(22,163,74,0.3)'
                  }}
                >
                  {creatingRepo ? "⏳ Creating..." : "🚀 Create & Push to GitHub"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}