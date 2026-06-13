'use client'
import { useState, useEffect, useRef } from "react"
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
            background: `rgba(139, 92, 246, ${p.opacity})`,
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
    <main style={{ minHeight: '100vh', background: '#050507', color: 'white', fontFamily: 'system-ui, sans-serif', position: 'relative', overflowX: 'hidden' }}>

      {/* AURORA BACKGROUND */}
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
          borderBottom: '1px solid rgba(139,92,246,0.15)',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(5,5,7,0.7)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800,
              boxShadow: '0 0 20px rgba(124,58,237,0.5)'
            }}
          >D</motion.div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>DevLaunch</span>
          <span style={{
            fontSize: 10, padding: '2px 8px',
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.4)',
            borderRadius: 20, color: '#a78bfa',
            fontWeight: 600, letterSpacing: '0.05em'
          }}>BETA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, color: '#52525b' }}>
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
              padding: '80px 24px 60px', minHeight: 'calc(100vh - 70px)'
            }}
          >
            {/* Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.4)',
                borderRadius: 20, padding: '6px 18px',
                fontSize: 13, color: '#a78bfa',
                marginBottom: 32, cursor: 'default',
                backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >✦</motion.span>
              AI-powered project scaffolding — Generate in seconds
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 'clamp(32px, 6vw, 64px)',
                fontWeight: 800, textAlign: 'center',
                lineHeight: 1.1, marginBottom: 20,
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
                color: '#71717a', textAlign: 'center',
                fontSize: 18, maxWidth: 520,
                marginBottom: 48, lineHeight: 1.7
              }}
            >
              Type your tech stack. Get every file, every config, every folder —
              <span style={{ color: '#a78bfa' }}> production ready instantly.</span>
            </motion.p>

            {/* INPUT BOX */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              style={{ width: '100%', maxWidth: 600 }}
            >
              <div
                className="input-glow"
                style={{
                  background: 'rgba(15,15,20,0.8)',
                  border: `1px solid ${focused ? 'rgba(139,92,246,0.6)' : 'rgba(139,92,246,0.2)'}`,
                  borderRadius: 20, padding: 8,
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.3s',
                  boxShadow: focused ? '0 0 0 1px rgba(124,58,237,0.3), 0 0 40px rgba(124,58,237,0.15)' : 'none'
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
                      fontSize: 16, color: 'white',
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
                        color: '#52525b', cursor: 'pointer',
                        fontSize: 18, padding: '0 4px'
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
                      ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #7c3aed 100%)'
                      : '#1c1c1f',
                    backgroundSize: '200% auto',
                    border: 'none', borderRadius: 14,
                    padding: '16px 20px', fontSize: 16,
                    fontWeight: 700, color: stack.trim() ? 'white' : '#3f3f46',
                    cursor: stack.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s',
                    letterSpacing: '0.02em'
                  }}
                >
                  {stack.trim() ? '⚡ Generate Scaffold →' : 'Type your stack above...'}
                </motion.button>
              </div>

              {/* EXAMPLE PILLS */}
              <div style={{
                display: 'flex', flexWrap: 'wrap',
                gap: 8, marginTop: 16, justifyContent: 'center'
              }}>
                <span style={{ fontSize: 12, color: '#3f3f46', alignSelf: 'center' }}>Try:</span>
                {EXAMPLES.map((ex) => (
                  <motion.button
                    key={ex}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStack(ex)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(139,92,246,0.2)',
                      borderRadius: 20, padding: '5px 14px',
                      fontSize: 12, color: '#71717a',
                      cursor: 'pointer', transition: 'all 0.2s',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {ex}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* FEATURE CARDS */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 12, marginTop: 64,
                width: '100%', maxWidth: 700
              }}
            >
              {[
                { icon: '⚡', title: 'Instant', desc: 'Full scaffold in 15 seconds', color: '#fbbf24' },
                { icon: '📁', title: 'File Tree', desc: 'Browse every file generated', color: '#34d399' },
                { icon: '🤖', title: 'AI Explain', desc: 'Understand any file instantly', color: '#a78bfa' },
                { icon: '🚀', title: 'Push to GitHub', desc: 'One click repo creation', color: '#60a5fa' },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="card-hover"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 16, padding: '20px 16px',
                    textAlign: 'center', cursor: 'default',
                    transition: 'all 0.3s',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div style={{
                    fontSize: 28, marginBottom: 10,
                    filter: `drop-shadow(0 0 8px ${f.color}88)`
                  }}>{f.icon}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: '#e4e4e7', marginBottom: 6,
                    letterSpacing: '-0.01em'
                  }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#52525b', lineHeight: 1.4 }}>{f.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* STATS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                display: 'flex', gap: 32, marginTop: 48,
                padding: '16px 32px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12, backdropFilter: 'blur(10px)'
              }}
            >
              {[
                { num: '10+', label: 'Frameworks' },
                { num: '< 20s', label: 'Generation time' },
                { num: '100%', label: 'Production ready' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa' }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>{s.label}</div>
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
              minHeight: 'calc(100vh - 70px)', padding: '24px'
            }}
          >
            <div style={{ position: 'relative', marginBottom: 32 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 64, height: 64,
                  border: '2px solid rgba(139,92,246,0.2)',
                  borderTopColor: '#7c3aed',
                  borderRightColor: '#4f46e5',
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
              style={{
                fontSize: 22, fontWeight: 700,
                marginBottom: 8, letterSpacing: '-0.02em'
              }}
            >
              Building your scaffold...
            </motion.div>
            <div style={{ color: '#52525b', fontSize: 14, marginBottom: 4 }}>
              Claude is generating your complete project
            </div>
            <div style={{ color: '#3f3f46', fontSize: 12 }}>
              This takes about 15-20 seconds
            </div>
            <motion.div
              style={{
                marginTop: 32, display: 'flex', gap: 8
              }}
            >
              {['Analyzing stack', 'Generating files', 'Writing configs', 'Finalizing'].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  style={{
                    fontSize: 11, color: '#a78bfa',
                    background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 20, padding: '4px 12px'
                  }}
                >
                  {step}
                </motion.div>
              ))}
            </motion.div>
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
              backdropFilter: 'blur(10px)'
            }}>
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} style={{
                color: '#f87171', background: 'none',
                border: 'none', cursor: 'pointer',
                fontSize: 18, marginLeft: 12
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
              borderBottom: '1px solid rgba(139,92,246,0.1)',
              padding: '10px 20px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(5,5,7,0.9)',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <motion.button
                  whileHover={{ x: -3 }}
                  onClick={() => { setScaffold(""); setFiles({}); setStack(""); setError("") }}
                  style={{
                    color: '#52525b', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  ← New scaffold
                </motion.button>
                <span style={{ color: '#27272a' }}>|</span>
                <span style={{
                  fontSize: 12, color: '#a78bfa',
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: 6, padding: '3px 10px',
                  fontWeight: 500
                }}>⚡ {stack}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  disabled={downloading}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: '7px 14px',
                    fontSize: 13, color: '#a1a1aa',
                    cursor: 'pointer', transition: 'all 0.2s',
                    backdropFilter: 'blur(10px)'
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
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    border: 'none', borderRadius: 8,
                    padding: '7px 16px', fontSize: 13,
                    fontWeight: 700, color: 'white',
                    cursor: 'pointer', letterSpacing: '0.02em'
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
                    background: 'rgba(34,197,94,0.06)',
                    borderBottom: '1px solid rgba(34,197,94,0.15)',
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
                  width: 230, borderRight: '1px solid rgba(139,92,246,0.1)',
                  overflowY: 'auto', paddingTop: 16,
                  background: 'rgba(5,5,7,0.6)',
                  backdropFilter: 'blur(20px)', flexShrink: 0
                }}
              >
                <div style={{
                  padding: '0 16px 10px',
                  fontSize: 10, color: '#3f3f46',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  fontWeight: 600
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
                      background: selectedFile === filename
                        ? 'rgba(139,92,246,0.12)' : 'transparent',
                      borderLeft: selectedFile === filename
                        ? '2px solid #7c3aed' : '2px solid transparent',
                      borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                      color: selectedFile === filename ? '#c4b5fd' : '#71717a',
                      cursor: 'pointer', transition: 'all 0.15s',
                      fontFamily: 'monospace', fontWeight: selectedFile === filename ? 600 : 400
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
                      borderBottom: '1px solid rgba(139,92,246,0.08)',
                      padding: '10px 20px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(5,5,7,0.8)',
                      backdropFilter: 'blur(10px)', flexShrink: 0
                    }}>
                      <span style={{
                        fontSize: 13, color: '#a1a1aa',
                        fontFamily: 'monospace', fontWeight: 500
                      }}>
                        📄 {selectedFile}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopy(files[selectedFile])}
                          style={{
                            background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: 6, padding: '5px 12px',
                            fontSize: 12, color: copied ? '#4ade80' : '#71717a',
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
                            background: 'rgba(139,92,246,0.08)',
                            border: '1px solid rgba(139,92,246,0.25)',
                            borderRadius: 6, padding: '5px 12px',
                            fontSize: 12, color: '#a78bfa',
                            cursor: 'pointer', transition: 'all 0.2s',
                            fontWeight: 500
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
                            background: 'rgba(139,92,246,0.04)',
                            borderBottom: '1px solid rgba(139,92,246,0.12)',
                            padding: '16px 20px', flexShrink: 0,
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <div style={{
                            fontSize: 10, color: '#7c3aed',
                            fontWeight: 700, marginBottom: 12,
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                            display: 'flex', alignItems: 'center', gap: 6
                          }}>
                            <motion.span
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            >✨</motion.span>
                            AI Explanation
                          </div>
                          <pre style={{
                            fontSize: 13, color: '#c4b5fd',
                            lineHeight: 1.8, whiteSpace: 'pre-wrap',
                            fontFamily: 'system-ui, sans-serif', margin: 0
                          }}>
                            {explanation}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <pre style={{
                      flex: 1, padding: 24,
                      fontSize: 13, color: '#94a3b8',
                      fontFamily: '"Fira Code", "Cascadia Code", monospace',
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
                background: 'rgba(10,10,15,0.95)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 20, padding: 28,
                width: '100%', maxWidth: 460,
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)'
              }}
            >
              <div style={{
                fontSize: 20, fontWeight: 700,
                marginBottom: 4, letterSpacing: '-0.02em'
              }}>
                🚀 Push to GitHub
              </div>
              <div style={{ fontSize: 13, color: '#52525b', marginBottom: 24, lineHeight: 1.5 }}>
                Create a new repository with all scaffold files pushed automatically.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{
                    fontSize: 11, color: '#52525b',
                    display: 'block', marginBottom: 8,
                    textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600
                  }}>
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-awesome-project"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, padding: '12px 16px',
                      color: 'white', fontSize: 14, outline: 'none',
                      boxSizing: 'border-box', transition: 'border 0.2s'
                    }}
                  />
                </div>

                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 8
                  }}>
                    <label style={{
                      fontSize: 11, color: '#52525b',
                      textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600
                    }}>
                      GitHub Token
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowTokenGuide(!showTokenGuide)}
                      style={{
                        fontSize: 11, color: '#7c3aed',
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
                          background: 'rgba(139,92,246,0.05)',
                          border: '1px solid rgba(139,92,246,0.15)',
                          borderRadius: 10, padding: '14px 16px',
                          marginBottom: 10, fontSize: 12,
                          color: '#a1a1aa', lineHeight: 2,
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#a78bfa', marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step by step:</div>
                        <div>1. Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed', fontWeight: 600 }}>github.com/settings/tokens</a></div>
                        <div>2. Click <strong style={{ color: '#e4e4e7' }}>"Generate new token (classic)"</strong></div>
                        <div>3. Add note: <strong style={{ color: '#e4e4e7' }}>"DevLaunch"</strong></div>
                        <div>4. Expiration: <strong style={{ color: '#e4e4e7' }}>90 days</strong></div>
                        <div>5. Check <strong style={{ color: '#e4e4e7' }}>"repo"</strong> scope only</div>
                        <div>6. Click <strong style={{ color: '#e4e4e7' }}>"Generate token"</strong></div>
                        <div>7. Copy token starting with <strong style={{ color: '#e4e4e7' }}>ghp_</strong></div>
                        <div style={{ marginTop: 8, color: '#3f3f46', fontSize: 11 }}>🔒 We never store your token.</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, padding: '12px 16px',
                      color: 'white', fontSize: 14, outline: 'none',
                      boxSizing: 'border-box'
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
                    flex: 1,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, padding: 13,
                    fontSize: 13, color: '#71717a', cursor: 'pointer'
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: creatingRepo || !githubToken || !repoName ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateRepo}
                  disabled={creatingRepo || !githubToken || !repoName}
                  style={{
                    flex: 2,
                    background: creatingRepo || !githubToken || !repoName
                      ? 'rgba(255,255,255,0.04)'
                      : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    border: 'none', borderRadius: 10,
                    padding: 13, fontSize: 13,
                    fontWeight: 700, color: creatingRepo || !githubToken || !repoName ? '#3f3f46' : 'white',
                    cursor: creatingRepo || !githubToken || !repoName ? 'not-allowed' : 'pointer',
                    boxShadow: creatingRepo || !githubToken || !repoName ? 'none' : '0 0 20px rgba(124,58,237,0.4)'
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