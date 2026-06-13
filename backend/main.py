from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import anthropic
import os
import re
import zipfile
import io
from dotenv import load_dotenv
import httpx

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───────────────────────────────────────────────────

class StackRequest(BaseModel):
    stack: str
    # What stack the user wants — e.g. "FastAPI + React + PostgreSQL"

class ExplainRequest(BaseModel):
    filename: str
    content: str
    # Which file to explain and its content

class RepoRequest(BaseModel):
    github_token: str
    repo_name: str
    files: dict
    # github_token — user's Personal Access Token
    # repo_name — what to call the new repo
    # files — dict of {filename: content} to push

# ─── Helper: Parse scaffold text into individual files ────────

def parse_scaffold_into_files(scaffold_text: str) -> dict:
    """
    Claude returns scaffold as one big markdown string.
    This function extracts individual files from it.
    
    It looks for patterns like:
    #### `filename.py`
```python
    ...code...
```
    
    Returns a dict: { "filename.py": "file content" }
    """
    files = {}
    
    # Pattern to find filenames in markdown headers like #### `main.py`
    pattern = r'#{1,6}\s+[`\*]?([^\`\*\n]+\.[a-zA-Z0-9]+)[`\*]?\s*\n+```[a-zA-Z]*\n(.*?)```'
    
    matches = re.findall(pattern, scaffold_text, re.DOTALL)
    
    for filename, content in matches:
        filename = filename.strip()
        content = content.strip()
        if filename and content:
            files[filename] = content
    
    # If no files found via pattern, create a single README with full scaffold
    if not files:
        files["scaffold.md"] = scaffold_text
    
    return files

# ─── Routes ───────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "DevLaunch backend is running"}
    # Health check — Render pings this to confirm app is alive

@app.post("/generate")
async def generate_scaffold(request: StackRequest):
    """
    Main endpoint — takes a tech stack string,
    calls Claude API, returns full scaffold as text.
    Frontend displays this in the UI.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""You are DevLaunch, an expert project scaffold generator.

The user wants to build a project using: {request.stack}

Generate a complete, production-ready project scaffold including:

1. FOLDER STRUCTURE — show the full directory tree

2. KEY FILES WITH CONTENT — for each file use this exact format:
#### `filename.ext`
```language
file content here
```

Include:
- All config files with actual working content
- .env.example with all required variables
- requirements.txt or package.json with correct packages
- .gitignore relevant to the stack
- README.md with setup instructions
- CORS configuration if applicable
- Database connection setup if applicable
- Basic entry point files

3. SETUP INSTRUCTIONS — exact commands to get it running

Be specific, practical, and production-ready. A developer should copy this and start building immediately.
"""

    try:
        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        scaffold = message.content[0].text
        
        # Also parse files immediately so frontend can use them
        files = parse_scaffold_into_files(scaffold)
        
        return {
            "scaffold": scaffold,
            "files": files
            # scaffold — full text for display
            # files — dict of individual files for file tree + download
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/download")
async def download_scaffold(request: StackRequest):
    """
    Generates scaffold AND returns it as a downloadable ZIP file.
    User gets actual files on their computer, ready to open.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""You are DevLaunch, an expert project scaffold generator.

The user wants to build a project using: {request.stack}

Generate a complete, production-ready project scaffold.

For each file use this exact format:
#### `path/to/filename.ext`
```language
file content here
```

Include all necessary files for a working project setup.
"""

    try:
        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

        scaffold = message.content[0].text
        files = parse_scaffold_into_files(scaffold)

        # Create ZIP file in memory — no disk writes needed
        zip_buffer = io.BytesIO()
        # BytesIO = a file-like object that lives in RAM, not on disk
        
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for filename, content in files.items():
                zip_file.writestr(filename, content)
                # writestr writes content directly into ZIP without temp files
        
        zip_buffer.seek(0)
        # seek(0) resets the "cursor" to the start of the buffer
        # Without this, we'd send an empty file

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=devlaunch-scaffold.zip"}
            # Content-Disposition tells browser: download this, don't display it
            # filename= sets the downloaded file's name
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain")
async def explain_file(request: ExplainRequest):
    """
    Takes a filename and its content.
    Claude explains what the file does, why it exists,
    and what the developer should modify first.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""You are DevLaunch, an expert developer mentor.

A developer just got this file generated for their project:

Filename: {request.filename}

Content:
{request.content}

Explain in simple, practical terms:
1. What this file does and why it exists in the project
2. The most important parts they should understand
3. What they should modify first when they start building
4. Any gotchas or common mistakes with this file

Keep it concise and practical. Talk like a senior developer explaining to a junior.
"""

    try:
        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        return {"explanation": message.content[0].text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-repo")
async def create_github_repo(request: RepoRequest):
    """
    Creates a real GitHub repository and pushes all scaffold files to it.
    Uses GitHub REST API with the user's Personal Access Token.
    User never has to touch Git manually.
    """
    headers = {
        "Authorization": f"token {request.github_token}",
        "Accept": "application/vnd.github.v3+json"
        # GitHub API requires this Accept header for v3
    }

    async with httpx.AsyncClient() as client:
        # Step 1: Create the repository
        create_response = await client.post(
            "https://api.github.com/user/repos",
            headers=headers,
            json={
                "name": request.repo_name,
                "description": f"Generated by DevLaunch — {request.repo_name}",
                "private": False,
                "auto_init": False
                # auto_init False because we're pushing our own files
            }
        )

        if create_response.status_code != 201:
            raise HTTPException(
                status_code=400,
                detail=f"GitHub repo creation failed: {create_response.json().get('message', 'Unknown error')}"
            )

        repo_data = create_response.json()
        repo_full_name = repo_data["full_name"]
        # full_name = "username/repo-name" — needed for file upload API

        # Step 2: Push each file to the repo
        import base64
        # base64 — GitHub API requires file content to be base64 encoded

        pushed_files = []
        failed_files = []

        for filename, content in request.files.items():
            encoded_content = base64.b64encode(content.encode()).decode()
            # encode() converts string to bytes
            # b64encode() encodes bytes to base64 bytes
            # .decode() converts base64 bytes back to string for JSON

            file_response = await client.put(
                f"https://api.github.com/repos/{repo_full_name}/contents/{filename}",
                headers=headers,
                json={
                    "message": f"feat: add {filename}",
                    "content": encoded_content
                }
            )

            if file_response.status_code in [200, 201]:
                pushed_files.append(filename)
            else:
                failed_files.append(filename)

        return {
            "success": True,
            "repo_url": repo_data["html_url"],
            # html_url = the GitHub URL user can click to see their repo
            "pushed_files": pushed_files,
            "failed_files": failed_files
        }