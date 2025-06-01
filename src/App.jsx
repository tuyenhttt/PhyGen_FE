import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer position='top-right' autoClose={2000} />
    </BrowserRouter>
  );
}

export default App;
