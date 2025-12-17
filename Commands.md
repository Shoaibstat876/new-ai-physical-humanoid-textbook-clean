cd apps/rag-backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000


cd apps/book-frontend
npm install
npm start

cd D:\new-ai-physical-humanoid-textbook\apps\rag-backend
.venv\Scripts\activate
python -m uvicorn app.main:app --reload

cd D:\new-ai-physical-humanoid-textbook\apps\auth-server
node server.js

