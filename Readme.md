# ⚡ TaskFlow — Team Task Manager

A full-stack team task management app with role-based access control, built with **React + Vite + Node.js + Express + MongoDB**.

## 🔗 Live Demo
> Add your Railway URL here after deployment

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) |
| Styling | Custom CSS with CSS variables |
| Deploy | Railway |

---

## 🚀 Features

### 🔐 Authentication
- **Signup** with name, email, password, and role selection (Admin / Member)
- **Login** with JWT token (7-day expiry)
- Protected routes — unauthenticated users redirected to login

### 👥 Role-Based Access Control
| Action | Admin | Member |
|--------|-------|--------|
| Create Project | ✅ | ❌ |
| Edit / Delete Project | ✅ | ❌ |
| Create Task | ✅ | ❌ |
| Edit / Delete Task | ✅ | ❌ |
| View own projects | ✅ | ✅ |
| Update task status | ✅ | ✅ |
| View Dashboard | ✅ | ✅ |

### 📁 Projects
- Create projects with name, description, and members
- Add/remove team members from projects
- Admin: full CRUD on all projects
- Member: view only projects they belong to

### ✅ Tasks (Kanban Board)
- Visual **3-column kanban board**: Todo → In Progress → Done
- One-click status transitions between columns
- Filter by status and project
- Overdue tasks highlighted in red
- Full CRUD for Admins; status-only updates for Members

### 📊 Dashboard
- Summary stats: Total, Completed, In Progress, Overdue tasks
- Overall progress bar with completion percentage
- Recent tasks table with status, assignee, and due date

---

## 📂 Project Structure

```
taskflow/
├── server.js              # Express server entry
├── models/
│   ├── User.js            # User schema
│   ├── Project.js         # Project schema
│   └── Task.js            # Task schema
├── routes/
│   ├── auth.js            # POST /api/auth/signup|login, GET /api/auth/me
│   ├── projects.js        # CRUD /api/projects
│   ├── tasks.js           # CRUD /api/tasks, GET /api/tasks/dashboard
│   └── users.js           # GET /api/users (admin), /api/users/members
├── middleware/
│   └── auth.js            # protect + adminOnly middlewares
└── client/                # React Vite frontend
    └── src/
        ├── pages/         # Login, Signup, Dashboard, Projects, Tasks
        ├── components/    # Layout, Sidebar
        ├── context/       # AuthContext (JWT + user state)
        └── services/      # api.js (axios)
```

---

## 🔗 API Reference

### Auth
```
POST /api/auth/signup    { name, email, password, role }
POST /api/auth/login     { email, password }
GET  /api/auth/me        (requires token)
```

### Projects
```
GET    /api/projects          List projects (filtered by role)
POST   /api/projects          Create project (Admin only)
GET    /api/projects/:id      Get single project
PUT    /api/projects/:id      Update project (Admin only)
DELETE /api/projects/:id      Delete project + tasks (Admin only)
```

### Tasks
```
GET    /api/tasks             List tasks (filtered by role)
GET    /api/tasks/dashboard   Dashboard stats + recent tasks
POST   /api/tasks             Create task (Admin only)
PUT    /api/tasks/:id         Update task (Admin: all fields; Member: status only)
DELETE /api/tasks/:id         Delete task (Admin only)
```

### Users
```
GET /api/users         All users (Admin only)
GET /api/users/members Members only
```

---

## 🖥️ Local Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
npm install
cd client && npm install && cd ..
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values:
# MONGO_URI=mongodb+srv://...
# JWT_SECRET=your_secret_key
# PORT=5000
```

### 3. Run development
```bash
# Terminal 1 — Backend
node server.js

# Terminal 2 — Frontend
cd client && npm run dev
```

Open `http://localhost:5173`

### 4. Build for production
```bash
npm run build      # builds client/dist
npm start          # serves everything from Express
```

---

## 🌐 Deploy to Railway

### Step 1 — MongoDB Atlas
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free cluster
2. Add database user (username + password)
3. Whitelist all IPs: `0.0.0.0/0`
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/taskflow`

### Step 2 — GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### Step 3 — Railway
1. Go to [railway.app](https://railway.app) → New Project
2. **Deploy from GitHub repo** → select your repo
3. Add **Environment Variables**:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_super_secret_key_here
   NODE_ENV=production
   PORT=5000
   ```
4. Railway auto-detects `railway.toml` and runs build + start
5. Go to **Settings → Networking → Generate Domain** for your live URL

---

## 🧪 Test Accounts (create via signup)
| Role | What you can do |
|------|----------------|
| Admin | Create projects & tasks, manage all |
| Member | View assigned projects, update task status |

---

## 📸 Screenshots
> Add screenshots here

---

## 🏗️ Built By
Your Name — [GitHub](https://github.com/YOUR_USERNAME)