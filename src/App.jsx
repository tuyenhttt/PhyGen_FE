// import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import routers from './routes/routers';
// import { Suspense } from 'react';

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Suspense>
//         <Routes>
//           {routers.map((item, index) => {
//             return (
//               <Route
//                 path={item.path}
//                 element={<item.component />}
//                 key={index}
//               />
//             );
//           })}
//         </Routes>
//       </Suspense>
//     </BrowserRouter>
//   );
// };

// export default App;

import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes/index.tsx';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
