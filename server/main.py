from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import glob
import subprocess
import shutil
from latexrender.main import convert_md_to_tex

app = FastAPI()

# Ensure build directory exists for static mounting
if not os.path.exists("build"):
    os.makedirs("build")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local dev convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RenderRequest(BaseModel):
    content: str
    template: str
    compile: bool = False

@app.get("/api/templates")
def get_templates():
    """List available LaTeX templates (.cls files) in the doc directory."""
    doc_dir = os.path.join(os.getcwd(), "doc")
    templates = []
    if os.path.exists(doc_dir):
        # Find all .cls files
        cls_files = glob.glob(os.path.join(doc_dir, "*.cls"))
        for f in cls_files:
            # Extract filename without extension (e.g., "matnoble")
            basename = os.path.splitext(os.path.basename(f))[0]
            templates.append(basename)
    return {"templates": templates}

@app.post("/api/render")
def render_pdf(request: RenderRequest):
    """
    Convert Markdown content to LaTeX and optionally compile to PDF.
    Returns the paths to the generated files.
    """
    # Create a temporary file for the markdown content
    # We use a fixed name in a temp folder inside existing doc structure or a new build folder
    # For simplicity, let's use 'build' folder in root
    build_dir = os.path.join(os.getcwd(), "build")
    if not os.path.exists(build_dir):
        os.makedirs(build_dir)
        
    md_filename = "document.md"
    tex_filename = "document.tex"
    
    md_path = os.path.join(build_dir, md_filename)
    tex_path = os.path.join(build_dir, tex_filename)
    
    # 1. Write Markdown content to file
    try:
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(request.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write markdown file: {str(e)}")
    
    # 2. Convert to LaTeX using the shared core logic
    try:
        success = convert_md_to_tex(md_path, tex_path, doc_class=request.template)
        if not success:
            raise HTTPException(status_code=500, detail="Markdown to LaTeX conversion failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")

    pdf_path = None
    compile_log = ""
    
    # 3. Optionally Compile
    if request.compile:
        # Check if latexmk exists
        if shutil.which("latexmk") is None:
             return {
                "success": True,
                "tex_path": tex_path,
                "pdf_path": None,
                "message": "LaTeX generated, but latexmk not found. Cannot compile PDF."
            }
            
        try:
            # Copy specific resources to build dir
            doc_dir = os.path.join(os.getcwd(), "doc")
            if os.path.exists(doc_dir):
                # 1. Copy the selected class file
                cls_src = os.path.join(doc_dir, f"{request.template}.cls")
                cls_dst = os.path.join(build_dir, f"{request.template}.cls")
                if os.path.exists(cls_src):
                    shutil.copy2(cls_src, cls_dst)
                
                # 2. Copy image resources
                image_extensions = {'.png', '.jpg', '.jpeg', '.pdf'}
                for item in os.listdir(doc_dir):
                    _, ext = os.path.splitext(item)
                    if ext.lower() in image_extensions:
                        shutil.copy2(os.path.join(doc_dir, item), os.path.join(build_dir, item))

            cmd = ["latexmk", "-xelatex", "-interaction=nonstopmode", tex_filename]
            result = subprocess.run(
                cmd, 
                cwd=build_dir, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                encoding="utf-8" # assuming utf-8 output from latexmk
            )
            
            compile_log = result.stdout + "\n" + result.stderr
            
            if result.returncode == 0:
                pdf_filename = "document.pdf"
                pdf_path = os.path.join(build_dir, pdf_filename)
                
                # 编译成功后清理辅助文件
                subprocess.run(
                    ["latexmk", "-c", tex_filename], 
                    cwd=build_dir,
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE
                )
            else:
                raise HTTPException(status_code=500, detail=f"LaTeX compilation failed.\nLog:\n{result.stdout}")
                
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"Compilation error: {str(e)}")

    return {
        "success": True,
        "tex_path": tex_path,
        "pdf_path": pdf_path,
        "pdf_url": f"/build/{os.path.basename(pdf_path)}" if pdf_path else None
    }

from fastapi.staticfiles import StaticFiles

# Mount the build directory to serve generated PDFs
app.mount("/build", StaticFiles(directory="build"), name="build")

# Mount the web frontend (static files)
# Check if web/dist exists (it should after npm run build)
web_dist = os.path.join(os.getcwd(), "web", "dist")
if os.path.exists(web_dist):
    app.mount("/", StaticFiles(directory=web_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
