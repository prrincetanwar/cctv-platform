import api from './api';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: { id: number; username: string; email: string; role: string; };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/api/auth/login', { username, password });
  sessionStorage.setItem('access_token', response.data.access_token);
  sessionStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data;
}

export function logout(): void {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user');
}

export function getStoredUser() {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  return Boolean(sessionStorage.getItem('access_token'));
}
