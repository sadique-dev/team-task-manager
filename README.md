Team Task Manager Application

This is a full-stack Team Task Manager web application that allows users to create projects, assign tasks, and track progress with role-based access control.

---

🚀 Tech Stack

Frontend:

* React (Vite)

Backend:

* Node.js
* Express.js

Database:

* MongoDB (MongoDB Atlas)

Authentication:

* JWT (JSON Web Tokens)

Deployment:

* Backend + Frontend deployed on Railway

---

✨ Features

* User Authentication (Signup/Login)
* Role-Based Access Control (Admin & Member)

Admin Capabilities:

* Create projects
* Add members to projects
* Create and assign tasks

Member Capabilities:

* View assigned tasks

* Update task status

* Dashboard to manage tasks and projects

---

🌐 Live Deployment

The application is fully deployed and working live on Railway:

Live URL:
https://team-task-manager-production-50a5.up.railway.app

---

⚙️ Environment Configuration

Backend (.env):

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key

Frontend (.env):

VITE_API_URL=https://team-task-manager-production-50a5.up.railway.app/api

---

🛠️ Deployment Notes

* MongoDB Atlas is used as the cloud database
* Network Access was configured to allow external connections (0.0.0.0/0) for Railway deployment
* Backend and frontend are integrated and served together via Express
* Application is deployed and hosted on Railway platform

---

📡 REST API Endpoints

Auth:
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me

Projects:
POST /api/projects
GET /api/projects
POST /api/projects/:projectId/members

Tasks:
POST /api/tasks
GET /api/tasks
PATCH /api/tasks/:taskId/status

---

🔄 Application Flow

1. User signs up as Admin or Member
2. Admin logs in
3. Admin creates a project
4. Admin adds members to the project
5. Admin creates and assigns tasks
6. Member logs in
7. Member views assigned tasks
8. Member updates task status

---

🔐 Security & Access Control

* JWT-based authentication
* Protected routes using middleware
* Role-based permissions:

  * Admin: Full access to projects and tasks
  * Member: Limited access to assigned tasks

---

📌 Notes

* REST API architecture is followed
* MongoDB (NoSQL) is used for flexible data handling
* Relationships maintained between Users, Projects, and Tasks
* Input validations implemented for secure operations

---

👤 Author

Mohd Sadiq

---

