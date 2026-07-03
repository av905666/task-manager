# ⚡ TaskFlow — Team Task Manager

A full-stack team task management app with role-based access control, built with **React + Vite + Node.js + Express + MongoDB**.

## 🔗 Live Demo
[> Click Here](https://task-manager-tauji.vercel.app/)

- **Frontend:** https://task-manager-tauji.vercel.app/
- **Backend API:** https://taskflow-1-w2m9.onrender.com

> Replace the above URLs with your deployed application URLs.

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Authentication | JWT (JSON Web Tokens) |
| HTTP Client | Axios |
| Styling | Custom CSS |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

---

## 🚀 Features

### 🔐 Authentication
- Secure Signup & Login using JWT
- Password hashing with bcrypt
- Protected routes
- Persistent authentication using Local Storage

### 👥 Role-Based Access Control

| Action | Admin | Member |
|--------|-------|--------|
| Create Project | ✅ | ❌ |
| Edit/Delete Project | ✅ | ❌ |
| Create Task | ✅ | ❌ |
| Edit/Delete Task | ✅ | ❌ |
| View Assigned Projects | ✅ | ✅ |
| Update Task Status | ✅ | ✅ |
| Dashboard Access | ✅ | ✅ |

---

### 📁 Projects

- Create and manage projects
- Assign team members
- Full CRUD operations for Admin
- Members can only view assigned projects

---

### ✅ Tasks (Kanban Board)

- Three-column Kanban Board
  - Todo
  - In Progress
  - Done
- Drag-free one-click status updates
- Filter tasks by project and status
- Highlight overdue tasks
- CRUD operations for Admin
- Status update permission for Members

---

### 📊 Dashboard

- Task statistics
- Progress overview
- Recent tasks
- Completion percentage
- Overdue task tracking

---

## 📂 Project Structure

```text
task-manager/
│
├── server.js
├── package.json
├── models/
│   ├── User.js
│   ├── Project.js
│   └── Task.js
├── routes/
│   ├── auth.js
│   ├── projects.js
│   ├── tasks.js
│   └── users.js
├── middleware/
│   └── auth.js
└── client/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    ├── package.json
    └── vite.config.js
```

---

## 🔗 API Endpoints

### Authentication

```http
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Projects

```http
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Tasks

```http
GET    /api/tasks
GET    /api/tasks/dashboard
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Users

```http
GET /api/users
GET /api/users/members
```

---

# 🖥️ Local Setup

## Prerequisites

- Node.js (v18+)
- MongoDB Atlas account

### Clone the repository

```bash
git clone https://github.com/av905666/task-manager.git
cd task-manager
```

### Install dependencies

Backend

```bash
npm install
```

Frontend

```bash
cd client
npm install
```

---

## Configure Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Frontend (.env.development)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Run the Application

### Backend

```bash
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🌐 Deployment

## Backend (Render)

1. Push your project to GitHub.
2. Create a new **Web Service** on Render.
3. Connect the GitHub repository.
4. Add the following environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=production
```

5. Deploy the backend.

---

## Frontend (Vercel)

1. Import the GitHub repository.
2. Set the **Root Directory** to:

```text
client
```

3. Configure:

```text
Build Command:
npm run build

Output Directory:
dist
```

4. Add the environment variable:

```env
VITE_API_URL=https://YOUR-RENDER-URL.onrender.com/api
```

5. Deploy.

---



## 👨‍💻 Built By

**Aditya Verma**

- GitHub: https://github.com/av905666
- Portfolio: https://adityaverma19.netlify.app/

---

## 🧪 Test Accounts (create via signup) | Role | What you can do | |------|----------------| | Admin | Create projects & tasks, manage all | | Member | View assigned projects, update task status | 

---

## 📸 Screenshots
> <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/16a7fb42-1c35-48a3-9e74-e1f479ea7de0" />

---

## ⭐ If you like this project

Please consider giving it a ⭐ on GitHub!


---

## 🏗️ Built By
Aditya Verma — [GitHub](https://github.com/av905666)
