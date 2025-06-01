import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes/index.tsx';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from '@/components/utils/ScrollToTop';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <ScrollToTop />
      <AppRoutes />
      <ToastContainer position='top-right' autoClose={2000} />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
