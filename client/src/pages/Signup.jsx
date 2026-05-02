import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, User, Shield, Loader } from 'lucide-react';
import './Auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('All fields required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card animate-fade">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Zap size={22} /></div>
          <span>TaskFlow</span>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join your team's workspace</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label>Full Name</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
              />
            </div>
          </div>

          <div className="field-group">
            <label>Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))}
              />
            </div>
          </div>

          <div className="field-group">
            <label>Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({...f, password: e.target.value}))}
              />
            </div>
          </div>

          <div className="field-group">
            <label>Role</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${form.role === 'member' ? 'active' : ''}`}
                onClick={() => setForm(f => ({...f, role: 'member'}))}
              >
                <User size={16} />
                Member
              </button>
              <button
                type="button"
                className={`role-btn admin ${form.role === 'admin' ? 'active' : ''}`}
                onClick={() => setForm(f => ({...f, role: 'admin'}))}
              >
                <Shield size={16} />
                Admin
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader size={16} className="spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
