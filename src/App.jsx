import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes/index.tsx';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from '@/components/utils/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
      <ToastContainer position='top-right' autoClose={2000} />
    </BrowserRouter>
  );
}

export default App;
