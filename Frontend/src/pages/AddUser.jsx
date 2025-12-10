import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import './AddUser.css';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      navigate('/users');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <Layout>
      <div className="add-user-container">
        <div className="add-user-header">
          <h1 className="add-user-title">Add New User</h1>
          <p className="add-user-subtitle">Create a new user account for your team</p>
        </div>

        <div className="add-user-card">
          <form onSubmit={handleSubmit} className="add-user-form">
            {/* Personal Information Section */}
            <div className="add-user-section">
              <h2 className="add-user-section-title">Personal Information</h2>
              
              <div className="add-user-form-row">
                <div className="add-user-form-group">
                  <label className="add-user-form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="add-user-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                  <span className="add-user-form-help">
                    Enter the user's complete name
                  </span>
                </div>
              </div>
            </div>

            {/* Account Credentials Section */}
            <div className="add-user-section">
              <h2 className="add-user-section-title">Account Credentials</h2>
              
              <div className="add-user-form-row two-cols">
                <div className="add-user-form-group">
                  <label className="add-user-form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="add-user-form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                  <span className="add-user-form-help">
                    This will be used for login
                  </span>
                </div>

                <div className="add-user-form-group">
                  <label className="add-user-form-label">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="add-user-form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    required
                    minLength="6"
                  />
                  <span className="add-user-form-help">
                    Must be at least 6 characters
                  </span>
                </div>
              </div>
            </div>

            {/* Role Selection Section */}
            <div className="add-user-section">
              <h2 className="add-user-section-title">User Role & Permissions</h2>
              
              <div className="add-user-role-options">
                <label
                  className={`add-user-role-option ${formData.role === 'staff' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="staff"
                    checked={formData.role === 'staff'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                  <div className="add-user-role-content">
                    <div className="add-user-role-title">👤 Staff Member</div>
                    <div className="add-user-role-description">
                      Can view inventory, add stock movements, and view reports. Cannot manage users or delete products.
                    </div>
                  </div>
                </label>

                <label
                  className={`add-user-role-option ${formData.role === 'admin' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                  <div className="add-user-role-content">
                    <div className="add-user-role-title">👑 Administrator</div>
                    <div className="add-user-role-description">
                      Full access to all features including user management, product creation/deletion, and system settings.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="add-user-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="add-user-btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="add-user-btn-submit"
                disabled={loading}
              >
                {loading ? 'Creating User...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddUser;
