import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { isAuthenticated } from './services/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cameras from './pages/Cameras';
import Watchlist from './pages/Watchlist';
import Alerts from './pages/Alerts';
import Search from './pages/Search';

function ProtectedRoute({ children }: { children: ReactNode }) {
  return isAuthenticated() ? children : <Navigate to='/login' replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/cameras' element={<ProtectedRoute><Cameras /></ProtectedRoute>} />
        <Route path='/watchlist' element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
        <Route path='/alerts' element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path='/search' element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </BrowserRouter>
  );
}
