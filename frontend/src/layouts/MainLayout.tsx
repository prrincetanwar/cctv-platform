import type { ReactNode } from 'react';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <div className='app-shell'><Sidebar /><div className='main-area'><Topbar /><main className='content-area'>{children}</main></div></div>;
}
