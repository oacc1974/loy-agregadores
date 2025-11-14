import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Aggregators from './pages/Aggregators';
import UberConfig from './pages/UberConfig';
import RappiConfig from './pages/RappiConfig';
import PedidosYaConfig from './pages/PedidosYaConfig';
import Orders from './pages/Orders';
import Logs from './pages/Logs';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aggregators"
            element={
              <ProtectedRoute>
                <Aggregators />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aggregators/uber"
            element={
              <ProtectedRoute>
                <UberConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aggregators/rappi"
            element={
              <ProtectedRoute>
                <RappiConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aggregators/pedidosya"
            element={
              <ProtectedRoute>
                <PedidosYaConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <Logs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
