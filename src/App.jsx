import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes';
import { ToastContainer } from 'react-toastify';
import { ScrollToTop } from '@/utils/ScrollToTop';
import ChatWidget from '@/pages/home/ChatWidget';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
      <ChatWidget />
      <ToastContainer position='top-right' autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
