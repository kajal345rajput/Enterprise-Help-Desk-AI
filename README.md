# Enterprise Help Desk Using AI Support Agent

An AI-powered enterprise IT help desk application that helps employees troubleshoot technical issues using AI and create support tickets when further assistance is required.

## Features

- Employee registration and login
- JWT-based authentication
- Role-based user management
- AI-powered IT support chatbot
- Retrieval-Augmented Generation (RAG)
- Semantic search using Gemini embeddings
- Knowledge base for IT troubleshooting
- AI conversation history
- AI conversation escalation into support tickets
- Ticket creation and tracking

## Technology Stack

**Frontend:** React.js, Vite, JavaScript, CSS, Axios, React Router, Lucide React

**Backend:** Python, Django, Django REST Framework, SQLite

**AI Integration:** Google Gemini API, Gemini Embeddings, Cosine Similarity, RAG

## User Roles

- Employee
- Support Staff
- Administrator

## Project Structure

- `backend/` — Django backend and API
- `backend/config/` — Django configuration
- `backend/helpdesk/` — Models, views, AI services and APIs
- `enterprise-help-desk/` — React frontend
- `enterprise-help-desk/src/` — Frontend components and pages

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Enterprise-Help-Desk-AI
```

### 2. Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Apply database migrations:

```powershell
python manage.py migrate
```

Start the backend:

```powershell
python manage.py runserver
```

### 3. Frontend Setup

Open another terminal:

```powershell
cd enterprise-help-desk
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

http://localhost:5173/

## Knowledge Base Indexing

Run this command from the backend directory:

```powershell
python manage.py index_knowledge_base
```

## Security

- Never commit API keys or environment files to GitHub.
- The `.env` file is excluded through `.gitignore`.
- Use your own Gemini API key locally.

## Project Status

Employee authentication, AI support chat, semantic knowledge retrieval, and AI-to-ticket escalation have been implemented and tested.

Support staff and administrator workflows are planned for further development.

## Author

MCA Project