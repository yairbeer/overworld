# overworld
A 2D asset pipeline and concept repository for solo developers harnessing AI. Bridging the gap between placeholder blocks and production-ready sprites

## Installation

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Git**

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # On Windows
   source .venv/bin/activate  # On macOS/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The server runs on `http://localhost:8000`

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app runs on `http://localhost:5173`

### Running Both
- Start the backend in one terminal (see Backend Setup step 4)
- Start the frontend in another terminal (see Frontend Setup step 3)
- Open `http://localhost:5173` in your browser to use the app

## Style Guide
The complete visual design system is documented in [index.md](index.md), which serves as the central index for all 12 style guide outputs located in the `output/` directory. This includes game overview, pixel art specs, color palette, sprite rules, lighting guidelines, and more.
