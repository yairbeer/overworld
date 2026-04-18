import torch
import gc
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import time
import asyncio
from pathlib import Path
from generators import generate_image as gen_image

# Tracking last time the FE was seen
last_seen = time.time()
HEARTBEAT_TIMEOUT = 10 # Seconds

app = FastAPI()

# Enable CORS for your React Frontend (Vite port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated files from the root output directory
output_dir = Path(__file__).parent.parent / "output"
output_dir.mkdir(parents=True, exist_ok=True)
app.mount("/files", StaticFiles(directory=str(output_dir)), name="files")

# Global variable to track what is currently sitting in VRAM
current_context = None # "images" | "music"
pipeline = None

def clear_vram():
    """Forcefully clears models from GPU and System RAM"""
    global pipeline
    if pipeline is not None:
        print("Purging current model from memory...")
        del pipeline
        pipeline = None
        
    # Standard PyTorch/Python memory cleanup
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()

@app.post("/switch-context/{target}")
async def switch_context(target: str):
    global current_context, pipeline
    
    if target == current_context:
        return {"status": "already_loaded", "context": target}
    
    # The laptop-saving move: Purge before loading anything new
    clear_vram()
    
    try:
        if target == "images":
            print("Loading FLUX Pipeline...")
            pipeline = gen_image.load_pipeline()
        elif target == "music":
            print("Loading MusicGen Pipeline...")
            # import music_gen logic here
            # pipeline = music_gen.load_pipeline()
            pass
            
        current_context = target
        return {"status": "success", "context": target}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate")
async def generate(prompt: str, type: str):
    global current_context, pipeline
    
    # Safety check: Ensure the right model is loaded
    if type != current_context:
        await switch_context(type)
        
    # Execute generation based on type
    if type == "images":
        # Save to root output directory (outside backend)
        filename = f"generated_{int(time.time())}.png"
        output_path = str(output_dir / filename)
        result_path = gen_image.generate_image(prompt, output_path)
        # Return a URL path that the frontend can fetch
        return {"status": "complete", "path": f"http://localhost:8000/files/{filename}"}
    elif type == "music":
        # TODO: Implement music generation
        return {"status": "complete", "path": "http://localhost:8000/files/placeholder.wav"}
    else:
        raise HTTPException(status_code=400, detail="Unknown generation type")


@app.on_event("startup")
async def startup_event():
    # Start the watchdog task
    asyncio.create_task(vram_watchdog())

async def vram_watchdog():
    global last_seen, current_context
    while True:
        await asyncio.sleep(5) # Check every 5 seconds
        if current_context and (time.time() - last_seen > HEARTBEAT_TIMEOUT):
            print("🚨 Frontend disconnected. Auto-purging VRAM...")
            clear_vram()
            current_context = None

@app.post("/heartbeat")
async def receive_heartbeat():
    global last_seen
    last_seen = time.time()
    return {"status": "alive"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)