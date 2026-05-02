import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, Calendar } from 'lucide-react';
import './Dashboard.css';

const statusConfig = {
  todo: { label: 'To Do', color: '#9898b0', bg: 'rgba(152,152,176,0.1)' },
  'in-progress': { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  done: { label: 'Done', color: '#22d3a8', bg: 'rgba(34,211,168,0.1)' },
};

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color, '--stat-bg': bg }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loading">
      <div className="loader" />
    </div>
  );

  const { stats, recentTasks } = data || { stats: {}, recentTasks: [] };

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="dashboard animate-fade">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="welcome-badge">
          👋 Hey, {user?.name?.split(' ')[0]}!
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={<ListTodo size={20} />}
          label="Total Tasks"
          value={stats.total ?? 0}
          color="var(--accent2)"
          bg="var(--accent-glow)"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Completed"
          value={stats.completed ?? 0}
          color="var(--green)"
          bg="var(--green-bg)"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="In Progress"
          value={stats.inProgress ?? 0}
          color="var(--blue)"
          bg="var(--blue-bg)"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Overdue"
          value={stats.overdue ?? 0}
          color="var(--red)"
          bg="var(--red-bg)"
        />
      </div>

      {/* Progress */}
      <div className="progress-card">
        <div className="progress-header">
          <div className="progress-title">
            <TrendingUp size={18} />
            <span>Overall Progress</span>
          </div>
          <span className="progress-pct">{completionPct}%</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${completionPct}%` }} />
        </div>
        <div className="progress-breakdown">
          <span className="breakdown-item todo">{stats.todo ?? 0} Todo</span>
          <span className="breakdown-item in-progress">{stats.inProgress ?? 0} In Progress</span>
          <span className="breakdown-item done">{stats.completed ?? 0} Done</span>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="recent-section">
        <h2 className="section-title">Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <ListTodo size={32} />
            <p>No tasks yet. {isAdmin ? 'Create your first task!' : 'Tasks assigned to you will appear here.'}</p>
          </div>
        ) : (
          <div className="recent-tasks">
            {recentTasks.map(task => {
              const s = statusConfig[task.status];
              const overdue = isOverdue(task);
              return (
                <div key={task._id} className={`task-row ${overdue ? 'overdue' : ''}`}>
                  <div className="task-row-left">
                    <span className="task-status-dot" style={{ background: s.color }} />
                    <div>
                      <span className="task-row-title">{task.title}</span>
                      <span className="task-row-project">{task.projectId?.name}</span>
                    </div>
                  </div>
                  <div className="task-row-right">
                    {task.assignedTo && (
                      <span className="task-assignee">{task.assignedTo.name}</span>
                    )}
                    <span className="task-badge" style={{ color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                    {task.dueDate && (
                      <span className={`task-due ${overdue ? 'overdue-text' : ''}`}>
                        <Calendar size={11} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}