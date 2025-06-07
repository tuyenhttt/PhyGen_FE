export const useAuth = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    isAuthenticated: !!user,
    user,
  };
};
