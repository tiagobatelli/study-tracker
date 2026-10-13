import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");

  const [taskName, setTaskName] = useState("");

  useEffect(() => {
    const sessionsRef = query(
      collection(db, "users", user.uid, "sessions"),
      orderBy("date", "desc")
    );
    const unsubSessions = onSnapshot(sessionsRef, (snap) => {
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const tasksRef = query(
      collection(db, "users", user.uid, "tasks"),
      orderBy("createdAt", "desc")
    );
    const unsubTasks = onSnapshot(tasksRef, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubSessions();
      unsubTasks();
    };
  }, [user]);

  async function addSession() {
    if (!subject || !date || !hours) return;
    await addDoc(collection(db, "users", user.uid, "sessions"), {
      subject,
      date,
      hours: Number(hours),
    });
    setSubject("");
    setDate("");
    setHours("");
  }

  async function deleteSession(id) {
    await deleteDoc(doc(db, "users", user.uid, "sessions", id));
  }

  async function addTask() {
    if (!taskName) return;
    await addDoc(collection(db, "users", user.uid, "tasks"), {
      name: taskName,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    setTaskName("");
  }

  async function toggleTask(id, completed) {
    await updateDoc(doc(db, "users", user.uid, "tasks", id), {
      completed: !completed,
    });
  }

  async function deleteTask(id) {
    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t("dashboard.title")}</h1>
        <div className="header-actions">
          <button onClick={() => i18n.changeLanguage("en")}>EN</button>
          <button onClick={() => i18n.changeLanguage("pt")}>PT</button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button className="btn-logout" onClick={() => {
            if (window.confirm(t("dashboard.logout_confirm"))) {
              signOut(auth);
            }
          }}>
            {t("dashboard.logout")}
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Sessões */}
        <section className="card">
          <h2>{t("dashboard.sessions")}</h2>
          <div className="form-row">
            <input
              placeholder={t("dashboard.subject")}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="number"
              placeholder={t("dashboard.hours")}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
            <button className="btn-primary" onClick={addSession}>
              + {t("dashboard.add_session")}
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="empty">{t("dashboard.no_sessions")}</p>
          ) : (
            <ul className="item-list">
              {sessions.map((s) => (
                <li key={s.id} className="item">
                  <span className="item-main">{s.subject}</span>
                  <span className="item-detail">{s.date}</span>
                  <span className="item-detail">{s.hours}h</span>
                  <button className="btn-delete" onClick={() => deleteSession(s.id)}>
                    {t("dashboard.delete")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Tarefas */}
        <section className="card">
          <h2>{t("dashboard.tasks")}</h2>
          <div className="form-row">
            <input
              placeholder={t("dashboard.task_name")}
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
            <button className="btn-primary" onClick={addTask}>
              + {t("dashboard.add_task")}
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="empty">{t("dashboard.no_tasks")}</p>
          ) : (
            <ul className="item-list">
              {tasks.map((task) => (
                <li key={task.id} className={`item ${task.completed ? "completed" : ""}`}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                  />
                  <span className="item-main">{task.name}</span>
                  <span className="item-detail">
                    {task.completed ? t("dashboard.completed") : t("dashboard.pending")}
                  </span>
                  <button className="btn-delete" onClick={() => deleteTask(task.id)}>
                    {t("dashboard.delete")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}