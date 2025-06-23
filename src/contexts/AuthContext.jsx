import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookieUser = Cookies.get('custom-user');
    if (cookieUser) {
      try {
        const parsedUser = JSON.parse(cookieUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to parse user cookie:', err);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  // Cài đặt thời gian hết hạn cookie: 1 giờ
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
  const COOKIE_OPTIONS = {
    path: '/',
    expires: oneHourFromNow,
  };

  // Đăng nhập: cập nhật user + cookie
  const login = userData => {
    setUser(userData);
    setIsAuthenticated(true);
    Cookies.set('custom-user', JSON.stringify(userData), COOKIE_OPTIONS);
  };

  // Đăng xuất: xóa user + cookie
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    Cookies.remove('custom-user', { path: '/' });
    Cookies.remove('token', { path: '/' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook sử dụng Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
