import { useLocation } from 'react-router-dom';
import ChatWidget from './ChatWidget';

const HIDE_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export default function ChatWidgetGate({ user }) {
  const { pathname } = useLocation();
  const p = pathname.toLowerCase();

  const isAuthPage = HIDE_PREFIXES.some(prefix => p.startsWith(prefix));

  const isAdminPage = p.startsWith('/admin');
  const role = String(user?.role || user?.roles?.[0] || '').toLowerCase();
  const isAdminUser = role === 'admin' || user?.isAdmin === true;

  if (isAuthPage || isAdminPage || isAdminUser) return null;
  return <ChatWidget />;
}
