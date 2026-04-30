# Team Task Manager

Minimal full-stack Team Task Manager built with:

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React + Vite
- Roles: `Admin` and `Member`

## Folder Structure

```text
team-task-manager/
  backend/
    config/
    middleware/
    models/
    routes/
    .env.example
    package.json
    server.js
  frontend/
    src/
    .env.example
    package.json
  .gitignore
  README.md
```

## Features

- Signup and login with JWT authentication
- Role-based access control
- Admin can:
  - create projects
  - add members to projects
  - create and assign tasks
- Member can:
  - view assigned tasks
  - update task status

## Backend Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
JWT_SECRET=replace_with_a_secret_key
```

## Frontend Environment Variables

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run the Backend

1. Open a terminal in `backend`
2. Install dependencies:

```bash
npm install
```

3. Create `backend/.env`
4. Start the backend:

```bash
npm run dev
```

The API will run at `http://localhost:5000`.

## Run the Frontend

1. Open a terminal in `frontend`
2. Install dependencies:

```bash
npm install
```

3. Create `frontend/.env`
4. Start the frontend:

```bash
npm run dev
```

The frontend will run at the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Step-by-Step App Flow

1. Sign up as an `Admin`
2. Sign up as one or more `Member` users
3. Login as the admin
4. Create a project
5. Add member users to the project
6. Create tasks and assign them to members
7. Login as a member
8. View assigned tasks and update task status

## Sample REST API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/users` - admin only

### Projects

- `POST /api/projects` - admin only
- `GET /api/projects`
- `POST /api/projects/:projectId/members` - admin only

### Tasks

- `POST /api/tasks` - admin only
- `GET /api/tasks`
- `PATCH /api/tasks/:taskId/status`

## Sample Request Payloads

### Signup

`POST /api/auth/signup`

```json
{
  "name": "Alice Admin",
  "email": "alice@example.com",
  "password": "123456",
  "role": "Admin"
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "alice@example.com",
  "password": "123456"
}
```

### Create Project

`POST /api/projects`

```json
{
  "name": "Website Redesign",
  "description": "Internal project for UI improvements"
}
```

### Add Member to Project

`POST /api/projects/:projectId/members`

```json
{
  "memberId": "USER_ID_HERE"
}
```

### Create Task

`POST /api/tasks`

```json
{
  "title": "Build dashboard",
  "description": "Create the initial dashboard page",
  "deadline": "2026-05-10",
  "assignedTo": "USER_ID_HERE",
  "projectId": "PROJECT_ID_HERE"
}
```

### Update Task Status

`PATCH /api/tasks/:taskId/status`

```json
{
  "status": "done"
}
```

## Notes

- Use the `Authorization` header for protected routes:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

- Admin users only see projects they created.
- Members only see projects they belong to.
- Members only see tasks assigned to them.
