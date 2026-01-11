from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
import os
import uuid
import subprocess
import shutil

# Import the core renderer
from latexrender.main import LaTeXRenderer

app = FastAPI(title="MatNoble LaTeX Renderer API")

# Setup paths
BASE_DIR = Path(__file__).parent.parent
BUILD_DIR = BASE_DIR / "build"
DOC_DIR = BASE_DIR / "doc"
BUILD_DIR.mkdir(exist_ok=True)

MAX_JOBS = 20

def cleanup_old_jobs():
    """Keep only the most recent MAX_JOBS in the build directory."""
    try:
        # Get all subdirectories in BUILD_DIR
        dirs = [d for d in BUILD_DIR.iterdir() if d.is_dir()]
        # Sort by modification time (oldest first)
        dirs.sort(key=lambda x: x.stat().st_mtime)
        
        # Remove oldest if count exceeds MAX_JOBS
        if len(dirs) > MAX_JOBS:
            for d in dirs[:-MAX_JOBS]:
                shutil.rmtree(d, ignore_errors=True)
    except Exception as e:
        print(f"Cleanup error: {e}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RenderRequest(BaseModel):
    content: str
    template: str
    compile: bool = False

@app.get("/api/templates")
async def get_templates():
    """Returns a list of available LaTeX templates."""
    if not DOC_DIR.exists():
        return {"templates": []}
    
    cls_files = list(DOC_DIR.glob("*.cls"))
    templates = [f.stem for f in cls_files]
    return {"templates": templates}

@app.post("/api/render")
async def render_pdf(request: RenderRequest):
    """
    Main endpoint for rendering. Captures and returns real-time logs.
    """
    cleanup_old_jobs()
    job_id = str(uuid.uuid4())[:8]
    job_dir = BUILD_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    
    md_path = job_dir / "document.md"
    tex_path = job_dir / "document.tex"
    pdf_path = job_dir / "document.pdf"

    logs = []

    try:
        # 1. Write the source content
        md_path.write_text(request.content, encoding="utf-8")
        logs.append(f"> Writing document.md... Done.")
        
        # 2. Initialize and run core renderer (conversion only)
        renderer = LaTeXRenderer(
            input_path=str(md_path), 
            output_path=str(tex_path), 
            template=request.template
        )
        
        if not renderer.render():
            logs.append("> Error: Markdown to LaTeX conversion failed.")
            return {"success": False, "logs": "\n".join(logs)}
        
        logs.append(f"> LaTeX source generated at {tex_path.name}")
            
        # 3. Handle Compilation manually to capture logs
        if request.compile:
            logs.append("> Starting LaTeXmk compilation...")
            
            # Replicate resource copying (since we aren't calling renderer.compile)
            renderer._copy_resources(DOC_DIR)
            
            cmd = ["latexmk", "-pdf", "-pdflatex=xelatex %O %S", "-interaction=nonstopmode", "document.tex"]
            
            # Run compilation and capture output
            process = subprocess.run(
                cmd, 
                cwd=job_dir, 
                capture_output=True, 
                text=True,
                encoding="utf-8"
            )
            
            # Combine stdout and stderr
            compile_output = process.stdout + "\n" + process.stderr
            logs.append(compile_output)
            
            if process.returncode != 0:
                logs.append(f"> Error: Compilation failed with exit code {process.returncode}")
                return {
                    "success": False, 
                    "logs": "\n".join(logs),
                    "detail": "LaTeX compilation failed."
                }
            
            logs.append("> Compilation successful. Cleaning up...")
            renderer.clean()
            logs.append("> Ready.")

        return {
            "success": True,
            "job_id": job_id,
            "logs": "\n".join(logs),
            "pdf_url": f"/build/{job_id}/document.pdf" if pdf_path.exists() else None
        }

    except Exception as e:
        logs.append(f"> System Error: {str(e)}")
        return {"success": False, "logs": "\n".join(logs)}

# Static file serving
app.mount("/build", StaticFiles(directory=str(BUILD_DIR)), name="build")

# Serve Frontend
WEB_DIST = BASE_DIR / "web" / "dist"
if WEB_DIST.exists():
    app.mount("/", StaticFiles(directory=str(WEB_DIST), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
