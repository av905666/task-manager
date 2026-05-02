import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject, getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, FolderKanban, Users, Trash2, Edit2, X, Loader, Search, UserPlus } from 'lucide-react';
import './Projects.css';

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

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', members: [] });

  const load = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        getProjects(),
        isAdmin ? getUsers() : Promise.resolve({ data: { users: [] } }),
      ]);
      setProjects(projRes.data.projects);
      setUsers(usersRes.data.users);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', members: [] });
    setShowModal(true);
  };

  const openEdit = (proj) => {
    setEditing(proj);
    setForm({
      name: proj.name,
      description: proj.description || '',
      members: proj.members.map(m => m._id),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      if (editing) {
        await updateProject(editing._id, form);
        toast.success('Project updated');
      } else {
        await createProject(form);
        toast.success('Project created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      setProjects(p => p.filter(x => x._id !== id));
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id],
    }));
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading"><div className="loader" /></div>;

  return (
    <div className="projects-page animate-fade">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="header-actions">
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> New Project
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={36} />
          <p>{search ? 'No matching projects' : isAdmin ? 'Create your first project!' : 'No projects assigned to you yet.'}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(proj => (
            <div key={proj._id} className="project-card">
              <div className="project-card-top">
                <div className="project-icon"><FolderKanban size={18} /></div>
                {isAdmin && (
                  <div className="project-actions">
                    <button className="icon-btn" onClick={() => openEdit(proj)} title="Edit"><Edit2 size={14} /></button>
                    <button className="icon-btn danger" onClick={() => handleDelete(proj._id)} title="Delete"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <h3 className="project-name">{proj.name}</h3>
              {proj.description && <p className="project-desc">{proj.description}</p>}
              <div className="project-footer">
                <div className="members-list">
                  {proj.members.slice(0, 4).map((m, i) => (
                    <div
                      key={m._id}
                      className="member-avatar"
                      title={m.name}
                      style={{ zIndex: 10 - i, marginLeft: i > 0 ? '-8px' : 0 }}
                    >
                      {m.name[0].toUpperCase()}
                    </div>
                  ))}
                  {proj.members.length > 4 && (
                    <div className="member-avatar extra">+{proj.members.length - 4}</div>
                  )}
                </div>
                <span className="member-count">
                  <Users size={12} /> {proj.members.length} member{proj.members.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="project-meta">
                <span>by {proj.createdBy?.name}</span>
                <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Project' : 'New Project'} onClose={() => setShowModal(false)}>
          <div className="modal-body">
            <div className="field-group">
              <label>Project Name *</label>
              <input
                className="field-input"
                placeholder="e.g. Website Redesign"
                value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
              />
            </div>
            <div className="field-group">
              <label>Description</label>
              <textarea
                className="field-input"
                placeholder="What is this project about?"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}))}
              />
            </div>
            {users.length > 0 && (
              <div className="field-group">
                <label><UserPlus size={13} /> Add Members</label>
                <div className="members-picker">
                  {users.map(u => (
                    <div
                      key={u._id}
                      className={`member-option ${form.members.includes(u._id) ? 'selected' : ''}`}
                      onClick={() => toggleMember(u._id)}
                    >
                      <div className="member-opt-avatar">{u.name[0].toUpperCase()}</div>
                      <div>
                        <div className="member-opt-name">{u.name}</div>
                        <div className="member-opt-role">{u.role}</div>
                      </div>
                      {form.members.includes(u._id) && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader size={14} className="spin" /> : (editing ? 'Save Changes' : 'Create Project')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}