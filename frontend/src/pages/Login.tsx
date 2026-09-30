import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield, User, Lock, LogIn } from 'lucide-react';
import { isAuthenticated, login } from '../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) return <Navigate to='/dashboard' replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return <div className='login-page'>
    <div className='login-card'>
      <div className='login-brand'><div className='brand-icon'><Shield size={30}/></div><div><strong>okDriver</strong><span>CCTV Intelligence Platform</span></div></div>
      <div className='login-heading'><h1>Secure Login</h1><p>Sign in to access the centralized monitoring platform.</p></div>
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <div className='input-wrap'><User size={17}/><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Enter username' required /></div>
        <label>Password</label>
        <div className='input-wrap'><Lock size={17}/><input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Enter password' required /></div>
        {error && <div className='login-error'>{error}</div>}
        <button className='login-button' type='submit' disabled={loading}><LogIn size={17}/>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <small className='login-footer'>Authorized personnel only</small>
    </div>
  </div>;
}
