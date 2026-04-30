import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const emptyAuthForm = {
  name: "",
  email: "",
  password: "",
  role: "Member",
};

const emptyProjectForm = {
  name: "",
  description: "",
};

const emptyTaskForm = {
  title: "",
  description: "",
  deadline: "",
  assignedTo: "",
  projectId: "",
};

function App() {
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [memberToAdd, setMemberToAdd] = useState({ projectId: "", memberId: "" });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "Admin";

  const availableMembers = useMemo(() => {
    if (isAdmin && users.length > 0) {
      return users.filter((member) => member.role === "Member");
    }

    const membersMap = new Map();

    projects.forEach((project) => {
      project.members.forEach((member) => {
        membersMap.set(member._id, member);
      });
    });

    return Array.from(membersMap.values());
  }, [isAdmin, projects, users]);

  const assignableMembers = useMemo(() => {
    if (!taskForm.projectId) {
      return availableMembers;
    }

    const selectedProject = projects.find((project) => project._id === taskForm.projectId);
    if (!selectedProject) {
      return availableMembers;
    }

    return selectedProject.members.filter((member) => member.role === "Member");
  }, [availableMembers, projects, taskForm.projectId]);

  const apiRequest = async (path, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  };

  const saveAuth = (authData) => {
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", JSON.stringify(authData.user));
  };

  const logout = () => {
    setToken("");
    setUser(null);
    setProjects([]);
    setTasks([]);
    setUsers([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const loadDashboard = async () => {
    const requests = [apiRequest("/projects"), apiRequest("/tasks")];

    if (isAdmin) {
      requests.push(apiRequest("/auth/users"));
    }

    const [projectData, taskData, userData] = await Promise.all(requests);

    setProjects(projectData);
    setTasks(taskData);
    setUsers(userData || []);
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadDashboard().catch((error) => {
      setMessage(error.message);
    });
  }, [isAdmin, token]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload =
        mode === "signup"
          ? authForm
          : { email: authForm.email, password: authForm.password };

      const data = await apiRequest(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      saveAuth(data);
      setAuthForm(emptyAuthForm);
      setMessage(`${mode === "signup" ? "Signup" : "Login"} successful`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await apiRequest("/projects", {
        method: "POST",
        body: JSON.stringify(projectForm),
      });
      setProjectForm(emptyProjectForm);
      await loadDashboard();
      setMessage("Project created");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await apiRequest(`/projects/${memberToAdd.projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ memberId: memberToAdd.memberId }),
      });
      setMemberToAdd({ projectId: "", memberId: "" });
      await loadDashboard();
      setMessage("Member added to project");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(taskForm),
      });
      setTaskForm(emptyTaskForm);
      await loadDashboard();
      setMessage("Task created");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    setLoading(true);
    setMessage("");

    try {
      await apiRequest(`/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadDashboard();
      setMessage("Task status updated");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <h1>Team Task Manager</h1>
        <p>Minimal React + Express + MongoDB task manager</p>

        <div className="row">
          <button type="button" onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" onClick={() => setMode("signup")}>
            Signup
          </button>
        </div>

        <form onSubmit={handleAuthSubmit}>
          {mode === "signup" && (
            <>
              <input
                placeholder="Name"
                value={authForm.name}
                onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
              />
              <select
                value={authForm.role}
                onChange={(event) => setAuthForm({ ...authForm, role: event.target.value })}
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
          />
          <button type="submit" disabled={loading}>
            {mode === "signup" ? "Create account" : "Login"}
          </button>
        </form>

        {message && <p>{message}</p>}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div>
          <h1>Dashboard</h1>
          <p>
            Logged in as {user.name} ({user.role})
          </p>
        </div>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>

      {message && <p>{message}</p>}

      {isAdmin && (
        <>
          <section>
            <h2>Create Project</h2>
            <form onSubmit={handleProjectCreate}>
              <input
                placeholder="Project name"
                value={projectForm.name}
                onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })}
              />
              <textarea
                placeholder="Project description"
                value={projectForm.description}
                onChange={(event) =>
                  setProjectForm({ ...projectForm, description: event.target.value })
                }
              />
              <button type="submit" disabled={loading}>
                Create Project
              </button>
            </form>
          </section>

          <section>
            <h2>Add Member to Project</h2>
            <form onSubmit={handleAddMember}>
              <select
                value={memberToAdd.projectId}
                onChange={(event) =>
                  setMemberToAdd({ ...memberToAdd, projectId: event.target.value })
                }
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <select
                value={memberToAdd.memberId}
                onChange={(event) =>
                  setMemberToAdd({ ...memberToAdd, memberId: event.target.value })
                }
              >
                <option value="">Select member</option>
                {availableMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} - {member.email}
                  </option>
                ))}
              </select>

              <button type="submit" disabled={loading}>
                Add Member
              </button>
            </form>
            <p>Signup member accounts first, then add them to a project.</p>
          </section>

          <section>
            <h2>Create Task</h2>
            <form onSubmit={handleTaskCreate}>
              <input
                placeholder="Task title"
                value={taskForm.title}
                onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
              />
              <textarea
                placeholder="Task description"
                value={taskForm.description}
                onChange={(event) =>
                  setTaskForm({ ...taskForm, description: event.target.value })
                }
              />
              <input
                type="date"
                value={taskForm.deadline}
                onChange={(event) => setTaskForm({ ...taskForm, deadline: event.target.value })}
              />
              <select
                value={taskForm.projectId}
                onChange={(event) =>
                  setTaskForm({ ...taskForm, projectId: event.target.value, assignedTo: "" })
                }
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <select
                value={taskForm.assignedTo}
                onChange={(event) => setTaskForm({ ...taskForm, assignedTo: event.target.value })}
              >
                <option value="">Assign to member</option>
                {assignableMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
              <button type="submit" disabled={loading}>
                Create Task
              </button>
            </form>
          </section>
        </>
      )}

      <section>
        <h2>{isAdmin ? "Projects" : "My Projects"}</h2>
        {projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          projects.map((project) => (
            <div key={project._id} className="card">
              <strong>{project.name}</strong>
              <p>{project.description || "No description"}</p>
              <p>Members: {project.members.map((member) => member.name).join(", ")}</p>
            </div>
          ))
        )}
      </section>

      <section>
        <h2>{isAdmin ? "Project Tasks" : "My Assigned Tasks"}</h2>
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="card">
              <strong>{task.title}</strong>
              <p>{task.description || "No description"}</p>
              <p>Status: {task.status}</p>
              <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
              <p>Project: {task.projectId?.name}</p>
              <p>Assigned To: {task.assignedTo?.name}</p>
              <select
                value={task.status}
                onChange={(event) => handleStatusUpdate(task._id, event.target.value)}
              >
                <option value="pending">pending</option>
                <option value="in-progress">in-progress</option>
                <option value="done">done</option>
              </select>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;
