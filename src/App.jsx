import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes';
import { ToastContainer } from 'react-toastify';
import { ScrollToTop } from '@/utils/ScrollToTop';
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
        <ToastContainer position='top-right' autoClose={2000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
