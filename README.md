# 🎓 Campus Flow — Student Management Portal

> A full-stack, multi-tenant educational portal designed for tutors, coaching centres, and small schools to manage their students, tests, assignments, and timetables — all in one place.

**Live Demo:** [campus-flow-blond.vercel.app](https://campus-flow-blond.vercel.app)  
**Backend API:** [campus-flow-auoq.onrender.com](https://campus-flow-auoq.onrender.com)

---

## 📸 Overview

Campus Flow is a production-ready web application that supports two distinct user roles — **Teachers** and **Students** — across completely isolated multi-tenant institutions. Each teacher can create and manage one or more institutions, and all data (students, tests, assignments, timetable) is scoped entirely to the active institution.

---

## ✨ Features

### 🔐 Authentication & Multi-Tenancy
- Separate login flows for **Teachers** and **Students**
- Secure session management via **JWT tokens stored in HTTP-only cookies**
- **Multi-institution support** — teachers can create, switch between, and manage multiple institutions
- Persistent active institution stored in `localStorage` for seamless session continuity
- Protected routes with automatic redirect to login for unauthenticated users
- Role-based UI — students see a read-only view, teachers see full management controls

### 🏫 Institution Management
- Create new institutions with a dedicated setup flow on registration
- Switch between institutions instantly from the header dropdown
- Delete an institution and auto-switch to the next available one
- Institution-scoped data isolation — all queries are filtered by the active institution

### 👩‍🎓 Student Management
- Add new students with just a **Name and Email** (all other fields are optional)
- Full student profile with: Grade, Board, School, Batch, Parent's Name, Parent's Phone, Birth Date
- Add new metadata values (grade, board, school, batch) on-the-fly without leaving the form
- **Inline editing** of any student's details directly from the student list
- Toggle student status between **Enrolled** and **Past** (alumni)
- Delete students with confirmation prompt
- Search and filter students by name, grade, or school
- Students are grouped into "Currently Enrolled" and "Past Students" sections

### 📝 Test Management
- Create tests with: Title, Total Marks, Date, and target Grades / Boards / Schools
- Tag tests with **chapter names** for syllabus tracking
- Manage test lifecycle with status tracking: `Not Started` → `Ongoing` → `Finished`
- **Assign students** to tests — system auto-filters eligible students based on grade/board targets
- **Enter marks** for each student enrolled in a test
- View individual test details with a full marks breakdown table
- Filter test student view by batch name
- Performance insights including highest marks, average marks, and pass/fail rates (per-test)

### 📋 Assignment Management
- Create assignments with a title, description/question text, batch, and optional due date
- **Upload up to 5 file attachments** per assignment (PDFs, images, documents)
- Files are stored **permanently on Supabase Cloud Storage** (CDN-backed, survives server restarts)
- Students can view all assignments and click to download/view attached files
- Teachers can delete assignments
- Filter assignments by batch name

### 📅 Timetable
- Full **monthly calendar view** for the institution's schedule
- Visualise class sessions as **colour-coded blocks** on a weekly time-grid (8 AM – 8 PM)
- Add classes with three flexible scheduling modes:
  - **Single Date** — one-off class on a specific day
  - **Everyday** — recurring daily class across a date range
  - **Custom Days** — pick specific weekdays (Mon, Wed, Fri, etc.) across a date range
- Delete individual class sessions directly from the calendar
- Today's date is visually highlighted across all week views
- Batch-tagged sessions for easy identification

### 📊 Dashboard
- At-a-glance summary cards: total students, tests, assignments
- Recent activity feeds
- Institution-level overview

### ⚙️ Settings
- Update institution name and details
- Manage account information
- Delete an institution (with automatic graceful fallback to remaining institution)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI framework |
| **Vite** | Fast dev server & build tool |
| **React Router v6** | Client-side SPA routing |
| **Axios** | HTTP client with interceptors |
| **Tailwind CSS v4** | Utility-first styling |
| **Lucide React** | Icon library |
| **date-fns** | Date formatting and manipulation |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express v5** | Web framework & REST API |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for schema modelling |
| **JSON Web Tokens (JWT)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Multer** | Multipart file upload handling (memory storage) |
| **@supabase/supabase-js** | Supabase Storage SDK for cloud file uploads |
| **cookie-parser** | HTTP cookie middleware |
| **cors** | Cross-origin request handling |
| **dotenv** | Environment variable management |

### Cloud & Infrastructure
| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting (SPA with rewrite rules) |
| **Render** | Backend API hosting |
| **MongoDB Atlas** | Cloud-hosted MongoDB database |
| **Supabase Storage** | Cloud file storage for assignment attachments |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB (local) or a MongoDB Atlas connection string
- A Supabase project with a bucket named `assignments` (optional — falls back to local `uploads/` folder)

### 1. Clone the Repository
```bash
git clone https://github.com/Tejas-Narula/Campus-Flow.git
cd Campus-Flow
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# Server Port
PORT=5000

# MongoDB URI
MONGODB_URI=mongodb://127.0.0.1:27017/campus-flow

# JWT Secret (use a long random string)
JWT_SECRET=your_super_secret_key_here

# Allowed Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Supabase Storage (optional — needed for cloud file uploads)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
```

Start the backend server:
```bash
npx nodemon server.js
```
The API will be running at `http://localhost:5000`.

### 3. Set Up the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend dev server:
```bash
npm run dev
```
The app will be running at `http://localhost:5173`.

---

## 📁 Project Structure

```
Campus-Flow/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & institution injection
│   ├── models/
│   │   ├── Assignment.js
│   │   ├── Institution.js
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Test.js
│   │   └── TimetableEntry.js
│   ├── routes/
│   │   ├── assignments.js        # File upload + CRUD
│   │   ├── auth.js               # Login, register, logout, /me
│   │   ├── institutions.js       # Institution CRUD
│   │   ├── students.js           # Student CRUD + metadata
│   │   ├── tests.js              # Test management + marks
│   │   └── timetable.js          # Timetable CRUD
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AddClassModal.jsx
    │   │   ├── AddStudentModal.jsx
    │   │   ├── CreateInstitutionModal.jsx
    │   │   ├── CreateTestModal.jsx
    │   │   ├── EnterMarksModal.jsx
    │   │   ├── Header.jsx
    │   │   ├── ManageTestStudentsModal.jsx
    │   │   └── Sidebar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state + axios config
    │   ├── pages/
    │   │   ├── Assignments.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Settings.jsx
    │   │   ├── Students.jsx
    │   │   ├── TestDetail.jsx
    │   │   ├── Tests.jsx
    │   │   └── Timetable.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── vercel.json                # SPA rewrite rules for Vercel
    └── package.json
```

---

## 🌐 Deployment

### Frontend (Vercel)
The `frontend/vercel.json` includes SPA rewrite rules to handle client-side routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Set the `VITE_API_URL` environment variable in your Vercel project settings to point to your live backend URL.

### Backend (Render)
Deploy the `backend/` directory. Set the following environment variables in Render:
- `MONGODB_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — a secure random secret
- `FRONTEND_URL` — your live Vercel frontend URL (no trailing slash)
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_KEY` — your Supabase `service_role` secret key

---

## 🔒 Security Notes

- All passwords are hashed using **bcryptjs** before storage — plaintext passwords are never saved.
- JWT tokens are stored in **HTTP-only cookies**, making them inaccessible to JavaScript and preventing XSS attacks.
- Production cookies are set with `sameSite: 'none'` and `secure: true` for cross-origin compatibility.
- The **Supabase `service_role` key** is only used server-side and never exposed to the frontend.
- All API routes are protected by the `authMiddleware`, which validates the JWT on every request.
- Institution data is always scoped via the `x-institution-id` header and validated server-side.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ by Tejas Narula*
