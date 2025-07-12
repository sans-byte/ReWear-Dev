import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

// Pages
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import ItemsPage from '@/pages/ItemsPage';
import ItemDetailPage from '@/pages/ItemDetailPage';
import AddItemPage from '@/pages/AddItemPage';
import DashboardPage from '@/pages/DashboardPage';
import AdminPage from '@/pages/AdminPage';

// Layout
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Requests from './pages/Requests';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="rewear-theme" >
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background w-screen">
            <Header />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/items" element={<ItemsPage />} />
                <Route path="/items/:id" element={<ItemDetailPage />} />
                <Route
                  path="/add-item"
                  element={
                    <ProtectedRoute>
                      <AddItemPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests"
                  element={
                    <ProtectedRoute>
                      <Requests />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;