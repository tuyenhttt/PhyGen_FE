import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookieUser = Cookies.get('custom-user');
    if (cookieUser) {
      try {
        const parsedUser = JSON.parse(cookieUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing cookie:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = userData => {
    setIsAuthenticated(true);
    setUser(userData);
    Cookies.set('custom-user', JSON.stringify(userData), { expires: 7 }); // << Thêm dòng này
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    Cookies.remove('custom-user');
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
