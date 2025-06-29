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
            const { data: profileData, error: profileError } = await supabase
              .from('user')
              .select('*')
              .eq('email', data.user.email)
              .single();

            if (profileData) {
              const fullUser = {
                email: data.user.email,
                fullName: profileData.fullName,
                role: profileData.role,
                avatar: profileData.avatar,
              };

              setUser(fullUser);
              setIsAuthenticated(true);
              Cookies.set('custom-user', JSON.stringify(fullUser), {
                path: '/',
                expires: 1,
              });
            } else {
              throw profileError || new Error('User not found in DB');
            }
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
