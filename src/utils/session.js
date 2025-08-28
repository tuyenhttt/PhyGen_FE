import Cookies from 'js-cookie';

export function forceLogout(reason) {
  Cookies.remove('token');
  Cookies.remove('refreshToken');
  Cookies.remove('custom-user');

  localStorage.setItem('auth:logout', Date.now());

  const msg = reason ? `?msg=${encodeURIComponent(reason)}` : '';
  window.location.replace(`/login${msg}`);
}
