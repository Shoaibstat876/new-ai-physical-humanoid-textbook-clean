cd apps/rag-backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000


cd apps/book-frontend
npm install
npm start


PS D:\new-ai-physical-humanoid-textbook> cd D:\new-ai-physical-humanoid-textbook\apps\auth-server
>> node server.js
-------------------------------------------------------------------------
cd D:\new-ai-physical-humanoid-textbook\apps\rag-backend
.venv\Scripts\activate
python -m uvicorn app.main:app --reload

curl http://127.0.0.1:8000/health


cd D:\new-ai-physical-humanoid-textbook\apps\auth-server
node server.js


curl http://127.0.0.1:3005/healthz


cd D:\new-ai-physical-humanoid-textbook\apps\book-frontend
npm start


