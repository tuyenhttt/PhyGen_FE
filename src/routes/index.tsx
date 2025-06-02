import { Routes, Route } from 'react-router-dom';
import publicRoutes from './publicRoutes';
import UserLayout from '@/layouts/UserLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ScrollToTop from '@/utils/ScrollToTop';
import ProtectedRoute from '@/routes/ProtectedRoute';
import privateRoutes from '@/routes/privateRoutes';

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Routes sử dụng User Layout */}
        <Route element={<UserLayout />}>
          {publicRoutes
            .filter(r => !r.path.startsWith('/admin'))
            .map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          {privateRoutes
            .filter(r => !r.path.startsWith('/admin'))
            .map(({ path, component: Component }) => (
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
        </Route>

        {/* Routes sử dụng Admin Layout */}
        <Route element={<AdminLayout />}>
          {publicRoutes
            .filter(r => r.path.startsWith('/admin'))
            .map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;
