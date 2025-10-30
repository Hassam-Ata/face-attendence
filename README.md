# AI-Powered Face Recognition Attendance System

Smart attendance management using facial recognition.

## Tech Stack

- **Frontend:** Next.js, shadcn/ui, TailwindCSS
- **Backend:** FastAPI, Python
- **ML:** OpenCV, Scikit-learn (Random Forest)
- **Database:** PostgreSQL (Neon)

## Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python database.py
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `backend/.env`:

```
DATABASE_URL=your_neon_postgres_url
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
