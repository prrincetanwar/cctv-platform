import { Bell, UserCircle } from 'lucide-react';
import { getStoredUser } from '../../services/auth';

export default function Topbar() {
  const user = getStoredUser();
  return <header className='topbar'>
    <div className='topbar-title'><span>Central Monitoring</span><small>AI-powered CCTV operations</small></div>
    <div className='topbar-actions'><button className='icon-button'><Bell size={19}/><span className='notification-dot'></span></button><div className='user-chip'><UserCircle size={28}/><div><strong>{user?.username || 'Operator'}</strong><span>{user?.role || 'USER'}</span></div></div></div>
  </header>;
}
