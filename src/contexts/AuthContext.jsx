import { supabase } from '@/supabase/supabaseClient';
import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const cookieUser = Cookies.get('custom-user');
        if (cookieUser) {
          const parsedUser = JSON.parse(cookieUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          const { data, error } = await supabase.auth.getUser();
          if (data?.user) {
            const fullUser = {
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name || '',
              role: 'User',
              avatar: data.user.user_metadata?.avatar_url || '',
            };
            setUser(fullUser);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Error restoring user:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  const COOKIE_OPTIONS = {
    path: '/',
    expires: 1,
  };

  const login = userData => {
    setUser(userData);
    setIsAuthenticated(true);
    Cookies.set('custom-user', JSON.stringify(userData), COOKIE_OPTIONS);
    if (userData.token) {
      Cookies.set('token', userData.token, COOKIE_OPTIONS);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);

    Cookies.remove('custom-user', { path: '/' });
    Cookies.remove('token', { path: '/' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
