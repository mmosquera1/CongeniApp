import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import RegisterPage from './pages/RegisterPage';
import NewReviewPage from './pages/NewReviewPage';
import ServicesPage from './pages/ServicesPage';
import MarketplacePage from './pages/MarketplacePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reviews/new" element={<NewReviewPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
