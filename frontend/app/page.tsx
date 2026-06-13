'use client'
import { useState } from "react"

type FileMap = { [filename: string]: string }

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

  const BACKEND = "https://devlaunch-backend-o7j6.onrender.com"

  const examples = [
    "Next.js + FastAPI + PostgreSQL",
    "React + Node.js + MongoDB",
    "Next.js + Supabase",
    "FastAPI + Redis + Docker",
    "Vue.js + Django + MySQL",
  ]

  const handleGenerate = async () => {
    if (!stack.trim()) return

    // Basic validation — must contain at least one known tech keyword
    const knownTechs = ['next', 'react', 'vue', 'angular', 'fastapi', 'django', 'flask', 'node', 'express', 'postgres', 'mysql', 'mongodb', 'redis', 'docker', 'supabase', 'firebase', 'tailwind', 'typescript', 'python', 'javascript']
    const inputLower = stack.toLowerCase()
    const hasValidTech = knownTechs.some(tech => inputLower.includes(tech))

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
    } catch (err: any) {
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
    } catch (err: any) {
      setError("Download failed.")
    } finally {
      setDownloading(false)
    }
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
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">

      {/* NAVBAR */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-600 rounded-md flex items-center justify-center text-xs font-bold">D</div>
          <span className="font-semibold text-white">DevLaunch</span>
        </div>
        <div className="text-xs text-zinc-500 border border-zinc-700 rounded-full px-3 py-1">
          Escape setup hell. Start building.
        </div>
      </nav>

      {/* HERO */}
      {!scaffold && !loading && (
        <div className="flex flex-col items-center justify-center px-6 pt-24 pb-10">
          <div className="inline-block bg-violet-950 border border-violet-700 rounded-full px-4 py-1 text-sm text-violet-300 mb-6">
            AI-powered project scaffolding
          </div>
          <h1 className="text-5xl font-bold text-center mb-4 leading-tight">
            Stop wasting hours on setup.<br />
            <span className="text-violet-400">Start building instantly.</span>
          </h1>
          <p className="text-zinc-400 text-center text-lg max-w-xl mb-10">
            Type your tech stack. DevLaunch generates every file, every config, every folder — production ready in seconds.
          </p>

          {/* INPUT */}
          <div className="w-full max-w-2xl">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="e.g. FastAPI + React + PostgreSQL"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-lg transition-all"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !stack.trim()}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:cursor-not-allowed rounded-xl px-5 py-4 font-semibold text-lg transition-all"
              >
                Generate Scaffold →
              </button>
            </div>

            {/* EXAMPLES */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setStack(ex)}
                  className="bg-zinc-900 border border-zinc-700 rounded-full px-3 py-1 text-sm text-zinc-400 hover:border-violet-500 hover:text-violet-400 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center justify-center px-6 pt-24">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-6" />
          <div className="text-xl font-semibold text-white mb-2">Generating your scaffold...</div>
          <div className="text-zinc-500">Claude is building your complete project structure</div>
          <div className="text-zinc-600 text-sm mt-1">This takes about 15-20 seconds</div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="max-w-2xl mx-auto px-6 mt-6">
          <div className="bg-red-950 border border-red-700 rounded-xl px-5 py-4 text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* RESULT — FILE TREE + CODE VIEW */}
      {scaffold && !loading && (
        <div className="flex flex-col h-screen">

          {/* TOP BAR */}
          <div className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setScaffold(""); setFiles({}); setStack(""); }}
                className="text-zinc-500 hover:text-white text-sm transition-all"
              >
                ← New scaffold
              </button>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-300 text-sm font-medium">{stack}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-sm text-zinc-300 transition-all"
              >
                {downloading ? "Downloading..." : "⬇ Download ZIP"}
              </button>
              <button
                onClick={() => setShowRepoModal(true)}
                className="bg-violet-600 hover:bg-violet-500 rounded-lg px-4 py-2 text-sm font-medium transition-all"
              >
                Push to GitHub →
              </button>
            </div>
          </div>

          {/* REPO SUCCESS */}
          {repoUrl && (
            <div className="mx-6 mt-3 bg-green-950 border border-green-700 rounded-xl px-5 py-3 text-green-400 text-sm flex items-center justify-between">
              <span>✓ Repository created successfully!</span>
              <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">
                View on GitHub →
              </a>
            </div>
          )}

          {/* MAIN CONTENT */}
          <div className="flex flex-1 overflow-hidden">

            {/* FILE TREE */}
            <div className="w-64 border-r border-zinc-800 overflow-y-auto py-4">
              <div className="px-4 mb-3 text-xs text-zinc-500 uppercase tracking-wider">Files</div>
              {Object.keys(files).map((filename) => (
                <button
                  key={filename}
                  onClick={() => { setSelectedFile(filename); setExplanation(""); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-all hover:bg-zinc-800 ${selectedFile === filename ? "bg-zinc-800 text-violet-400 border-r-2 border-violet-500" : "text-zinc-400"}`}
                >
                  {filename}
                </button>
              ))}
            </div>

            {/* CODE VIEW */}
            <div className="flex-1 overflow-y-auto">
              {selectedFile && files[selectedFile] && (
                <div className="h-full flex flex-col">
                  {/* File header */}
                  <div className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
                    <span className="text-sm text-zinc-300 font-mono">{selectedFile}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(files[selectedFile])}
                        className="bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-1 text-xs text-zinc-400 transition-all"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleExplain(selectedFile, files[selectedFile])}
                        className="bg-violet-900 hover:bg-violet-800 border border-violet-700 rounded-lg px-3 py-1 text-xs text-violet-300 transition-all"
                      >
                        {explaining ? "Explaining..." : "✨ Explain this file"}
                      </button>
                    </div>
                  </div>

                  {/* Explanation */}
                  {explanation && (
                    <div className="mx-6 mt-4 bg-violet-950 border border-violet-800 rounded-xl p-4 text-sm text-violet-200 leading-relaxed">
                      <div className="text-xs text-violet-400 mb-2 font-medium">AI Explanation</div>
                      {explanation}
                    </div>
                  )}

                  {/* Code */}
                  <pre className="flex-1 p-6 text-sm text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {files[selectedFile]}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GITHUB MODAL */}
      {showRepoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-1">Push to GitHub</h2>
            <p className="text-zinc-400 text-sm mb-4">Create a new GitHub repo with all scaffold files pushed automatically.</p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Repository Name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">GitHub Personal Access Token</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-sm"
                />
                <p className="text-xs text-zinc-600 mt-1">Generate at github.com/settings/tokens — needs repo scope. We never store your token.</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowRepoModal(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRepo}
                disabled={creatingRepo || !githubToken || !repoName}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg px-4 py-3 text-sm font-medium transition-all"
              >
                {creatingRepo ? "Creating..." : "Create & Push →"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}