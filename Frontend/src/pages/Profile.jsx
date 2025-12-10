import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [generalForm, setGeneralForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    avatarUrl: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setGeneralForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [user]);

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.put('/auth/profile', generalForm);
      if (res.data.user) {
        updateUser(res.data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await api.put('/auth/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error changing password' });
    } finally {
      setLoading(false);
    }
  };

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    try {
      // Immediate save to backend
      const res = await api.put('/auth/profile', { avatarUrl: photoUrlInput });
      
      // Update local state and global context
      if (res.data.user) {
        updateUser(res.data.user);
        setGeneralForm(prev => ({ ...prev, avatarUrl: photoUrlInput }));
        setMessage({ type: 'success', text: 'Profile photo updated!' });
        setIsPhotoModalOpen(false);
      }
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Failed to save photo');
    }
  };

  const handleRemovePhoto = async () => {
    if(!window.confirm('Are you sure you want to remove your profile photo?')) return;
    
    try {
       const res = await api.put('/auth/profile', { avatarUrl: null });
       if (res.data.user) {
         updateUser(res.data.user);
         setGeneralForm(prev => ({ ...prev, avatarUrl: '' }));
         setPhotoUrlInput('');
         setMessage({ type: 'success', text: 'Profile photo removed!' });
         setIsPhotoModalOpen(false);
       }
    } catch (error) {
      setUploadError('Failed to remove photo');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        setUploadError('File size too large. Please use an image under 500KB.');
        return;
      }
      setUploadError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrlInput(reader.result); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const openPhotoModal = () => {
    setPhotoUrlInput(generalForm.avatarUrl);
    setUploadError('');
    setIsPhotoModalOpen(true);
  };

  return (
    <Layout>
      <div className="profile-header">
        <div className="profile-avatar-wrapper" onClick={openPhotoModal}>
          {generalForm.avatarUrl ? (
            <img src={generalForm.avatarUrl} alt="Profile" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              {generalForm.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="profile-avatar-overlay">
            <span>📷 Edit</span>
          </div>
        </div>
        <div className="profile-title">
          <h2>{generalForm.name}</h2>
          <p>{user?.role?.toUpperCase()} ACCOUNT</p>
        </div>
      </div>
      
      {/* Photo Edit Modal */}
      {isPhotoModalOpen && (
        <div className="photo-modal-overlay">
          <div className="photo-modal-content premium-modal">
            <h3 className="modal-title">Update Profile Photo</h3>
            
            <form onSubmit={handlePhotoSubmit} className="modal-form">
              {/* Top Section: Upload Area */}
              <div className="upload-section">
                <label className="upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input-hidden"
                  />
                  <div className="upload-content">
                    <span className="upload-icon">☁️</span>
                    <p className="upload-text">Click to Upload Image</p>
                    <p className="upload-subtext">Max size: 500KB</p>
                  </div>
                </label>
              </div>

              {uploadError && <p className="modal-error">{uploadError}</p>}

              {/* Middle Section: Preview (Conditional) */}
              {photoUrlInput && (
                <div className="preview-section">
                   <p className="preview-label">New Photo Preview</p>
                   <div className="preview-image-wrapper">
                     <img src={photoUrlInput} alt="Preview" className="preview-img" />
                   </div>
                </div>
              )}

              {/* Bottom Section: Actions */}
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={handleRemovePhoto}
                  className="btn-remove"
                  style={{ visibility: generalForm.avatarUrl ? 'visible' : 'hidden' }}
                >
                  Remove Current Photo
                </button>
                <div className="action-buttons-right">
                  <button type="button" onClick={() => setIsPhotoModalOpen(false)} className="btn-cancel">Cancel</button>
                  <button type="submit" className="btn-save">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="profile-tabs">
        <button 
          className={`profile-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General Information
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      <div className="profile-form-container">
        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'general' ? (
          <form onSubmit={handleGeneralSubmit} className="form-stack">
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={generalForm.name}
                onChange={e => setGeneralForm({...generalForm, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={generalForm.email}
                onChange={e => setGeneralForm({...generalForm, email: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={generalForm.phone}
                onChange={e => setGeneralForm({...generalForm, phone: e.target.value})}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={generalForm.dob}
                onChange={e => setGeneralForm({...generalForm, dob: e.target.value})}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="form-stack">
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
