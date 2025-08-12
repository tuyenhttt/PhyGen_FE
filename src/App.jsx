import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes';
import { ToastContainer } from 'react-toastify';
import { ScrollToTop } from '@/utils/ScrollToTop';
import ChatWidgetGate from '@/pages/home/ChatWidgetGate';

function App() {
  const storedUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
      <ChatWidgetGate user={storedUser} />
      <ToastContainer position='top-right' autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
