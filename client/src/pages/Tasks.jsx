import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getProjects, getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus, CheckSquare, Trash2, Edit2, X, Loader, Search,
  Calendar, User, Tag, Filter, ChevronDown, AlertTriangle
} from 'lucide-react';
import './Tasks.css';

const STATUSES = [
  { value: 'todo', label: 'To Do', color: 'var(--text2)', bg: 'rgba(152,152,176,0.12)' },
  { value: 'in-progress', label: 'In Progress', color: 'var(--blue)', bg: 'var(--blue-bg)' },
  { value: 'done', label: 'Done', color: 'var(--green)', bg: 'var(--green-bg)' },
];

function statusInfo(s) { return STATUSES.find(x => x.value === s) || STATUSES[0]; }

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-fade">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', projectId: '', assignedTo: '', status: 'todo', dueDate: ''
  });

  const load = async () => {
    try {
      const [tasksRes, projRes, usersRes] = await Promise.all([
        getTasks(),
        getProjects(),
        isAdmin ? getUsers() : Promise.resolve({ data: { users: [] } }),
      ]);
      setTasks(tasksRes.data.tasks);
      setProjects(projRes.data.projects);
      setUsers(usersRes.data.users);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', projectId: '', assignedTo: '', status: 'todo', dueDate: '' });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId?._id || '',
      assignedTo: task.assignedTo?._id || '',
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.projectId) return toast.error('Project is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      };
      if (editing) {
        await updateTask(editing._id, payload);
        toast.success('Task updated');
      } else {
        await createTask(payload);
        toast.success('Task created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task._id, { status: newStatus });
      setTasks(ts => ts.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(ts => ts.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchProject = !filterProject || t.projectId?._id === filterProject;
    return matchSearch && matchStatus && matchProject;
  });

  const grouped = {
    todo: filtered.filter(t => t.status === 'todo'),
    'in-progress': filtered.filter(t => t.status === 'in-progress'),
    done: filtered.filter(t => t.status === 'done'),
  };

  if (loading) return <div className="page-loading"><div className="loader" /></div>;

  return (
    <div className="tasks-page animate-fade">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="header-actions">
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select
            className="filter-select"
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          {isAdmin && (
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {STATUSES.map(({ value, label, color, bg }) => (
          <div key={value} className="kanban-col">
            <div className="kanban-header" style={{ '--col-color': color }}>
              <div className="kanban-title">
                <span className="kanban-dot" style={{ background: color }} />
                <span>{label}</span>
              </div>
              <span className="kanban-count">{grouped[value].length}</span>
            </div>

            <div className="kanban-cards">
              {grouped[value].length === 0 && (
                <div className="kanban-empty">No tasks</div>
              )}
              {grouped[value].map(task => {
                const overdue = isOverdue(task);
                return (
                  <div key={task._id} className={`task-card ${overdue ? 'overdue' : ''}`}>
                    {overdue && (
                      <div className="overdue-badge">
                        <AlertTriangle size={11} /> Overdue
                      </div>
                    )}
                    <div className="task-card-header">
                      <span className="task-title">{task.title}</span>
                      {isAdmin && (
                        <div className="task-card-actions">
                          <button className="icon-btn-sm" onClick={() => openEdit(task)}><Edit2 size={12} /></button>
                          <button className="icon-btn-sm danger" onClick={() => handleDelete(task._id)}><Trash2 size={12} /></button>
                        </div>
                      )}
                    </div>

                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}

                    <div className="task-meta">
                      {task.projectId && (
                        <span className="task-tag project-tag">{task.projectId.name}</span>
                      )}
                      {task.assignedTo && (
                        <span className="task-tag user-tag">
                          <User size={10} /> {task.assignedTo.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className={`task-tag ${overdue ? 'overdue-tag' : 'date-tag'}`}>
                          <Calendar size={10} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Status changer */}
                    <div className="status-changer">
                      {STATUSES.filter(s => s.value !== value).map(s => (
                        <button
                          key={s.value}
                          className="status-btn"
                          style={{ '--s-color': s.color, '--s-bg': s.bg }}
                          onClick={() => handleStatusChange(task, s.value)}
                        >
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Task' : 'New Task'} onClose={() => setShowModal(false)}>
          <div className="modal-body">
            <div className="field-group">
              <label>Title *</label>
              <input
                className="field-input"
                placeholder="Task title"
                value={form.title}
                onChange={e => setForm(f => ({...f, title: e.target.value}))}
              />
            </div>
            <div className="field-group">
              <label>Description</label>
              <textarea
                className="field-input"
                placeholder="What needs to be done?"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}))}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field-group">
                <label>Project *</label>
                <select
                  className="field-input"
                  value={form.projectId}
                  onChange={e => setForm(f => ({...f, projectId: e.target.value}))}
                >
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Status</label>
                <select
                  className="field-input"
                  value={form.status}
                  onChange={e => setForm(f => ({...f, status: e.target.value}))}
                >
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field-group">
                <label>Assign To</label>
                <select
                  className="field-input"
                  value={form.assignedTo}
                  onChange={e => setForm(f => ({...f, assignedTo: e.target.value}))}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Due Date</label>
                <input
                  type="date"
                  className="field-input"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({...f, dueDate: e.target.value}))}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader size={14} className="spin" /> : (editing ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}