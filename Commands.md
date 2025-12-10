cd apps/rag-backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000


cd apps/book-frontend
npm install
npm start
