import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, ListChecks, AlertTriangle, Search, Shield } from 'lucide-react';
import { logout } from '../../services/auth';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cameras', label: 'Cameras', icon: Camera },
  { to: '/watchlist', label: 'Watchlist', icon: ListChecks },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/search', label: 'Entity Search', icon: Search },
];

export default function Sidebar() {
  return <aside className='sidebar'>
    <div className='sidebar-brand'><div className='brand-icon'><Shield size={24}/></div><div><strong>okDriver</strong><span>CCTV Intelligence</span></div></div>
    <nav className='sidebar-nav'>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
    <div className='sidebar-bottom'><button className='logout-button' onClick={() => { logout(); window.location.href = '/login'; }}>Logout</button></div>
  </aside>;
}
