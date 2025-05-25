// import { useAuth } from '@/contexts/AuthContext';
// import { Navigate } from 'react-router-dom';

// interface PrivateRouteProps {
//   children: React.ReactNode;
// }

// const PrivateRoute = ({ children }: PrivateRouteProps) => {
//   const { isAuthenticated } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to='/login' replace />;
//   }

//   return children;
// };

// export default PrivateRoute;

import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to='/login' replace />;
  }

  return children;
};

export default ProtectedRoute;
