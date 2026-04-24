import React, { useState } from 'react';
import { userService } from '../../services/api';
import toast from 'react-hot-toast';

const SettingsModal = ({ isOpen, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState('password');
  const [loading, setLoading] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset states when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab('password');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setDeletePassword('');
      setDeleteConfirm('');
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to change password...');
      const response = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      console.log('Password change response:', response);
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to delete account...');
      const response = await userService.deleteAccount(deletePassword);
      console.log('Delete response:', response);
      toast.success('Account deleted successfully');
      localStorage.removeItem('token');
      onClose();
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Delete account error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to delete account';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-gray-200">Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors border-b-2
              ${activeTab === 'password' 
                ? 'text-blue-400 border-blue-500 bg-gray-700/50' 
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-700/30'
              }`}
          >
            🔒 Password
          </button>
          <button
            onClick={() => {
              setActiveTab('danger');
              setShowDeleteConfirm(false);
            }}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors border-b-2
              ${activeTab === 'danger' 
                ? 'text-red-400 border-red-500 bg-gray-700/50' 
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-700/30'
              }`}
          >
            ⚠️ Danger Zone
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg 
                           text-gray-200 placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg 
                           text-gray-200 placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg 
                           text-gray-200 placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-4">
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <h3 className="text-red-400 font-semibold mb-2">⚠️ Delete Account</h3>
                <p className="text-gray-400 text-sm">
                  This action cannot be undone. This will permanently delete your account 
                  and all associated data including chats and messages.
                </p>
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                           font-semibold transition-colors"
                >
                  I want to delete my account
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Enter your password to confirm
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg 
                               text-gray-200 placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Type <span className="text-red-400 font-bold">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg 
                               text-gray-200 placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                        setDeleteConfirm('');
                      }}
                      className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg 
                               font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading || deleteConfirm !== 'DELETE' || !deletePassword}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                               font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Deleting...' : 'Delete Forever'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;