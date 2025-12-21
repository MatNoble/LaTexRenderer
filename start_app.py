import uvicorn
import webbrowser
import os
import sys
import threading
import time

def open_browser():
    """Wait a bit for server to start, then open browser."""
    time.sleep(1.5)
    webbrowser.open("http://localhost:8000")

def check_build():
    """Check if frontend build exists."""
    if not os.path.exists(os.path.join("web", "dist")):
        print("Warning: Frontend build not found in 'web/dist'.")
        print("Please run 'cd web && npm run build' first.")
        # We don't exit here, just warn, in case user only wants API
        
if __name__ == "__main__":
    check_build()
    
    print("Starting LaTexRender App...")
    print("Serving at http://localhost:8000")
    
    # Open browser in a separate thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Start server
    # We use 'server.main:app' string to enable potential reload if needed, 
    # but here we use direct import for simplicity in a script or just call run
    # To keep it simple and consistent with uvicorn CLI:
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=False)
