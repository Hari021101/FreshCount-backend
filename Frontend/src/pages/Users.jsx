import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import api from '../api/axios';

import './Users.css';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'staff'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      setUsers(res.data.users);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/auth/users/${userId}`);
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  return (
    <Layout>
      <div>
        <div className="users-header">
          <div className="users-title-section">
            <h2>User Management</h2>
            <p>Manage admin and staff accounts</p>
          </div>
          <button 
            onClick={() => navigate('/users/add')}
            className="btn btn-primary"
          >
            + Add User
          </button>
        </div>

        <div className="users-table-wrapper">
          <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8 text-slate-400">Loading users...</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td className="font-medium text-slate-900">{user.name}</td>
                      <td className="text-slate-500">{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-blue' : 'badge-green'}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-slate-500 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="text-red-400 hover:text-red-600 p-1 transition-colors"
                          title="Delete User"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleSubmit} className="form-stack">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div className="form-grid">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="Min. 6 characters"
                required
                minLength="6"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">User Role</label>
            <select
              className="form-input"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              required
            >
              <option value="staff">Staff - View & Add Stock</option>
              <option value="admin">Admin - Full Access</option>
            </select>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Users;
