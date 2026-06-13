'use client'
import { useState } from "react"

export default function Home() {
  const [stack, setStack] = useState("")
  const [scaffold, setScaffold] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!stack.trim()) return
    setLoading(true)
    setError("")
    setScaffold("")

    try {
      const response = await fetch("https://devlaunch-backend-o7j6.onrender.com/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stack }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Something went wrong")
      setScaffold(data.scaffold)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center px-6 pt-20 pb-10">
        <div className="inline-block bg-zinc-900 border border-zinc-700 rounded-full px-4 py-1 text-sm text-zinc-400 mb-6">
          Stop wasting time on setup. Start building.
        </div>
        <h1 className="text-5xl font-bold text-center mb-4">
          Generate your project scaffold
          <span className="text-violet-400"> in seconds</span>
        </h1>
        <p className="text-zinc-400 text-center text-lg max-w-xl mb-10">
          Type your tech stack. DevLaunch generates every file, every config, every folder — production ready. Instantly.
        </p>

        {/* INPUT BOX */}
        <div className="w-full max-w-2xl">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="e.g. FastAPI + React + PostgreSQL"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-lg"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !stack.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl px-5 py-4 font-semibold text-lg transition-all"
            >
              {loading ? "Generating your scaffold..." : "Generate Scaffold →"}
            </button>
          </div>

          {/* EXAMPLE TAGS */}
          <div className="flex flex-wrap gap-2 mt-4">
            {["Next.js + FastAPI + PostgreSQL", "React + Node.js + MongoDB", "Next.js + Supabase", "FastAPI + Redis + Docker"].map((example) => (
              <button
                key={example}
                onClick={() => setStack(example)}
                className="bg-zinc-900 border border-zinc-700 rounded-full px-3 py-1 text-sm text-zinc-400 hover:border-violet-500 hover:text-violet-400 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="max-w-2xl mx-auto px-6 mb-6">
          <div className="bg-red-900/30 border border-red-500 rounded-xl px-5 py-4 text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="max-w-2xl mx-auto px-6 mb-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-8 text-center">
            <div className="text-zinc-400 text-lg mb-2">Claude is generating your scaffold...</div>
            <div className="text-zinc-600 text-sm">This takes about 10-15 seconds</div>
          </div>
        </div>
      )}

      {/* RESULT */}
      {scaffold && (
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Your Scaffold is Ready</h2>
            <button
              onClick={() => navigator.clipboard.writeText(scaffold)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-sm text-zinc-300 transition-all"
            >
              Copy All
            </button>
          </div>
          <pre className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {scaffold}
          </pre>
        </div>
      )}

    </main>
  )
}