import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from '@/utils/ScrollToTop';

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
