import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import StockHistory from './pages/StockHistory';
import Users from './pages/Users';
import AddUser from './pages/AddUser';
import Profile from './pages/Profile';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          
          <Route path="/products/add" element={
            <ProtectedRoute requireAdmin={true}>
              <AddProduct />
            </ProtectedRoute>
          } />
          
          <Route path="/products/edit/:productId" element={
            <ProtectedRoute requireAdmin={true}>
              <EditProduct />
            </ProtectedRoute>
          } />
          
          <Route path="/stock-history" element={
            <ProtectedRoute>
              <StockHistory />
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute requireAdmin={true}>
              <Users />
            </ProtectedRoute>
          } />
          
          <Route path="/users/add" element={
            <ProtectedRoute requireAdmin={true}>
              <AddUser />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
