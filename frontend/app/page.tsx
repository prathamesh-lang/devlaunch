"use client";
// "use client" — tells Next.js this component runs in the browser, not on the server.
// We need this because we're using useState and handling user interactions (clicks, input).
// Without this, Next.js tries to render it on the server, which can't handle browser events.

import { useState } from "react";
// useState — React hook that lets us store and update values in the component.
// Every time a useState value changes, React re-renders the component automatically.

export default function Home() {
  const [stack, setStack] = useState("");
  // stack — stores whatever the user types in the input box.
  // setStack — the function we call to update it.
  // "" — starts as empty string.

  const [output, setOutput] = useState("");
  // output — stores the AI-generated scaffold text returned from our backend.
  // Starts empty, gets filled after the API call succeeds.

  const [loading, setLoading] = useState(false);
  // loading — boolean (true/false) to track if we're waiting for the API response.
  // We use this to show "Generating..." on the button so user knows something is happening.

  const [error, setError] = useState("");
  // error — stores any error message to show the user if something goes wrong.

  const handleGenerate = async () => {
    // async function — because we're making an API call which takes time.
    // We use await inside to pause and wait for the response before continuing.

    if (!stack.trim()) return;
    // .trim() removes whitespace from both ends of the string.
    // If the input is empty or just spaces, we do nothing (return early).

    setLoading(true);   // Show "Generating..." on button
    setError("");       // Clear any previous error
    setOutput("");      // Clear any previous output

    try {
      const response = await fetch("http://localhost:8000/generate", {
        // fetch — browser's built-in function to make HTTP requests.
        // We're calling our FastAPI backend running on port 8000.
        // "/generate" is the endpoint we'll create in FastAPI.

        method: "POST",
        // POST because we're sending data (the stack) to the server.
        // GET is for fetching data, POST is for sending data.

        headers: {
          "Content-Type": "application/json",
          // Tells the server: "I'm sending JSON, not a form or plain text."
          // FastAPI needs this to correctly parse the request body.
        },

        body: JSON.stringify({ stack }),
        // JSON.stringify converts the JS object { stack: "FastAPI + React" }
        // into a JSON string: '{"stack":"FastAPI + React"}'
        // That's what gets sent over the network.
      });

      if (!response.ok) {
        // response.ok is true if HTTP status is 200-299.
        // If server returns 400, 500, etc., we throw an error.
        throw new Error("Server error. Try again.");
      }

      const data = await response.json();
      // response.json() parses the JSON response body from FastAPI.
      // await because parsing is also async.
      // data will be: { scaffold: "...the generated text..." }

      setOutput(data.scaffold);
      // Update output state with the scaffold text.
      // React re-renders and shows the result on screen.

    } catch (err) {
      setError("Something went wrong. Make sure the backend is running.");
      // Catches network errors (backend offline, wrong URL, etc.)
      // and shows a user-friendly message.
    } finally {
      setLoading(false);
      // finally runs whether the try succeeded or catch fired.
      // Always turn off loading spinner when done.
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-16">
      {/* min-h-screen — full viewport height */}
      {/* bg-gray-950 — very dark background, pro look */}
      {/* flex flex-col items-center — center everything vertically stacked */}
      {/* px-4 py-16 — horizontal padding 16px, vertical padding 64px */}

      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">
          🚀 DevLaunch
        </h1>
        <p className="text-gray-400 text-lg">
          Type your tech stack. Get a production-ready project scaffold instantly.
        </p>
      </div>

      {/* INPUT CARD */}
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl p-8 shadow-xl">

        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Your Tech Stack
        </label>
        {/* block — makes label take full width on its own line */}

        <input
          type="text"
          value={stack}
          onChange={(e) => setStack(e.target.value)}
          // onChange fires every time user types a character.
          // e.target.value is the current text in the input box.
          // We update stack state, which updates the input display.

          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          // Let user press Enter to trigger generation. Better UX.

          placeholder="e.g. FastAPI + React + PostgreSQL"
          className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-violet-500 transition"
        // focus:border-violet-500 — border turns purple when user clicks the input.
        // transition — smooth color change animation.
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          // disabled={loading} — button can't be clicked while waiting for response.
          // Prevents duplicate requests.

          className="mt-4 w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-base"
        // hover:bg-violet-700 — darker purple on hover
        // disabled:bg-gray-700 — gray when disabled
        // disabled:cursor-not-allowed — shows ⊘ cursor when disabled
        >
          {loading ? "Generating..." : "Generate Scaffold ⚡"}
          {/* Ternary operator: if loading is true show "Generating...", else show normal text */}
        </button>

        {/* ERROR MESSAGE */}
        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
          // Only renders if error string is not empty.
          // Short-circuit rendering: {condition && <JSX>}
        )}
      </div>

      {/* OUTPUT AREA — only shows when output is not empty */}
      {output && (
        <div className="w-full max-w-2xl mt-8 bg-gray-900 rounded-2xl p-8 shadow-xl">
          <h2 className="text-lg font-bold text-violet-400 mb-4">
            Generated Scaffold
          </h2>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
            {/* pre — preserves whitespace and line breaks exactly as returned from API */}
            {/* whitespace-pre-wrap — wraps long lines instead of horizontal scroll */}
            {output}
          </pre>
        </div>
      )}

    </main>
  );
}