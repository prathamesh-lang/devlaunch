from fastapi import FastAPI, HTTPException
# FastAPI — the web framework we're using to build the backend API
# HTTPException — used to return proper HTTP error responses (like 400, 500)

from fastapi.middleware.cors import CORSMiddleware
# CORS — Cross Origin Resource Sharing
# Our frontend runs on localhost:3000, backend on localhost:8000
# By default browsers BLOCK requests between different ports — CORS fixes that

from pydantic import BaseModel
# Pydantic — data validation library built into FastAPI
# BaseModel lets us define exactly what shape of data we expect to receive

import anthropic
# The official Anthropic Python library to call Claude API

import os
# os — built-in Python module to read environment variables

from dotenv import load_dotenv
# load_dotenv — reads our .env file and loads the variables into os.environ

load_dotenv()
# Actually loads the .env file — must be called before os.getenv()

app = FastAPI()
# Creates the FastAPI application instance
# This is the main object — all routes and middleware attach to this

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://devlaunch.vercel.app"],
    # Allow requests from our frontend — local dev and production Vercel URL
    # Replace "devlaunch" with your actual Vercel URL after deployment
    allow_credentials=True,
    allow_methods=["*"],
    # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],
    # Allow all headers
)

class StackRequest(BaseModel):
    stack: str
    # Defines the shape of the request body we expect from the frontend
    # When frontend sends { "stack": "FastAPI + React" }, this validates it
    # If "stack" is missing, FastAPI automatically returns a 422 error

@app.get("/")
def root():
    return {"message": "DevLaunch backend is running"}
    # Simple health check endpoint
    # Visit localhost:8000 in browser to confirm backend is alive

@app.post("/generate")
async def generate_scaffold(request: StackRequest):
    # This is the main endpoint — frontend calls POST /generate
    # FastAPI automatically parses the request body into StackRequest object
    # async — because calling Claude API takes time, we don't want to block

    api_key = os.getenv("ANTHROPIC_API_KEY")
    # Reads the API key from environment variables (loaded from .env)
    # Never hardcode API keys directly in code

    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    # If .env is missing or key is empty, return a 500 error immediately
    # Better to fail fast with a clear message than a confusing error later

    client = anthropic.Anthropic(api_key=api_key)
    # Creates the Anthropic client with our API key
    # This is what we use to actually call Claude

    prompt = f"""You are DevLaunch, an expert project scaffold generator.

The user wants to build a project using: {request.stack}

Generate a complete, production-ready project scaffold including:

1. FOLDER STRUCTURE — show the full directory tree
2. KEY FILES WITH CONTENT:
   - All config files (with actual working content)
   - .env.example (with all required variables)
   - requirements.txt or package.json (with correct packages and versions)
   - .gitignore (relevant to the stack)
   - README.md (with setup instructions)
   - CORS configuration if applicable
   - Database connection setup if applicable
   - Basic folder structure files (empty __init__.py, index files, etc.)

3. SETUP INSTRUCTIONS — exact commands to get it running

Be specific, practical, and complete. A developer should be able to copy this and start building immediately without any additional setup research.
"""
    # This is the prompt we send to Claude
    # f-string lets us inject request.stack dynamically
    # The more specific the prompt, the better Claude's output

    try:
        message = client.messages.create(
            model="claude-opus-4-6",
            # Using Claude Opus — most capable model, best for complex generation
            max_tokens=4096,
            # Maximum tokens in the response — 4096 gives plenty of room for full scaffolds
            messages=[
                {"role": "user", "content": prompt}
            ]
            # messages array — this is the conversation we send to Claude
            # For a single request like ours, just one user message is enough
        )

        scaffold = message.content[0].text
        # message.content is a list of content blocks
        # [0] gets the first block, .text gets the actual string
        
        return {"scaffold": scaffold}
        # Returns JSON: { "scaffold": "...generated text..." }
        # Frontend reads data.scaffold to display the result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        # If Claude API call fails for any reason, return a 500 with the error message
        # str(e) converts the exception to a readable string