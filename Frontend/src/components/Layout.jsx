import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="sidebar-toggle-btn"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>

        {/* Logo */}
        <div className="sidebar-logo-section">
          <h1 className="sidebar-logo">
            {sidebarCollapsed ? 'FC' : 'FreshCount'}
          </h1>
          {!sidebarCollapsed && (
            <p className="sidebar-version">v1.0.0</p>
          )}
        </div>

        {/* Menu */}
        <div className="sidebar-menu">
          {!sidebarCollapsed && (
            <p className="sidebar-menu-label">MENU</p>
          )}
          
          <Link 
            to="/" 
            className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
            title="Dashboard"
          >
            <span className="sidebar-link-icon">📊</span>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Link>
          
          <Link 
            to="/products" 
            className={`sidebar-link ${isActive('/products') ? 'active' : ''}`}
            title="Inventory"
          >
            <span className="sidebar-link-icon">📦</span>
            {!sidebarCollapsed && <span>Inventory</span>}
          </Link>
          
          <Link 
            to="/stock-history" 
            className={`sidebar-link ${isActive('/stock-history') ? 'active' : ''}`}
            title="Stock History"
          >
            <span className="sidebar-link-icon">📋</span>
            {!sidebarCollapsed && <span>Stock History</span>}
          </Link>
        </div>

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <div className="sidebar-admin-section">
            {!sidebarCollapsed && (
              <p className="sidebar-menu-label">ADMIN</p>
            )}
            
            <Link 
              to="/users" 
              className={`sidebar-link ${isActive('/users') ? 'active' : ''}`}
              title="User Management"
            >
              <span className="sidebar-link-icon">👥</span>
              {!sidebarCollapsed && <span>User Management</span>}
            </Link>
          </div>
        )}

        {/* User Info */}
        <div className="sidebar-user-section">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
              ) : (
                user?.name?.[0] || 'U'
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-details">
                <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p className="sidebar-user-name">{user?.name}</p>
                  <p className="sidebar-user-role">{user?.role}</p>
                </Link>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className="sidebar-logout-btn"
            title="Logout"
          >
            {sidebarCollapsed ? '↪' : '↪ Logout'}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className="main-content-wrapper">
        <div className="main-content">
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarCollapsed(false)}
          >
            ☰
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
