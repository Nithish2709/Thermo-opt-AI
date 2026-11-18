import sys
import os
import uvicorn

# Ensure the backend directory is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

if __name__ == "__main__":
    print(f"Starting THERMO-OPT Backend from: {CURRENT_DIR}")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        app_dir=CURRENT_DIR,
    )

