import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import publicRoutes from '@/routes/publicRoutes';
import privateRoutes from '@/routes/privateRoutes';
import ProtectedRoute from '@/routes/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}

        {/* Private Routes */}
        {privateRoutes.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                <Component />
              </ProtectedRoute>
            }
          />
        ))}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
