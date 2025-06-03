// import { Routes, Route } from 'react-router-dom';
// import publicRoutes from './publicRoutes';
// import privateRoutes from './privateRoutes';
// import ScrollToTop from '@/utils/ScrollToTop';
// import ProtectedRoute from './ProtectedRoute';

// const AppRoutes = () => {
//   return (
//     <>
//       <ScrollToTop />
//       <Routes>
//         {/* Public routes */}
//         {publicRoutes.map(({ path, component: Component }) => (
//           <Route key={path} path={path} element={<Component />} />
//         ))}

//         {/* Private routes */}
//         {privateRoutes.map(({ path, component: Component }) => (
//           <Route
//             key={path}
//             path={path}
//             element={
//               <ProtectedRoute>
//                 <Component />
//               </ProtectedRoute>
//             }
//           />
//         ))}
//       </Routes>
//     </>
//   );
// };

// export default AppRoutes;

import { Routes, Route } from 'react-router-dom';
import publicRoutes from './publicRoutes';
import ScrollToTop from '@/utils/ScrollToTop';

const renderRoutes = routes =>
  routes.map(({ path, component: Component, children, index }) => (
    <Route
      key={path || 'index'}
      path={path}
      index={index}
      element={<Component />}
    >
      {children && renderRoutes(children)}
    </Route>
  ));

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>{renderRoutes(publicRoutes)}</Routes>
    </>
  );
};

export default AppRoutes;
