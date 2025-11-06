/**
 * UserMenu - User authentication menu component
 *
 * Features:
 * - Shows login button when not authenticated
 * - Shows user profile with dropdown when authenticated
 * - User selection modal for mock login
 * - Logout functionality
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../common/Icon';
import type { UsersData } from '../../types';

export default function UserMenu() {
  const { user, login, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [users, setUsers] = useState<UsersData['users']>([]);

  // Load users for the login modal
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/data/users.json');
        const data: UsersData = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    loadUsers();
  }, []);

  const handleLogin = (userId: string) => {
    login(userId);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm"
        >
          <Icon name="user" className="w-4 h-4" />
          <span className="hidden sm:inline">Log in</span>
        </button>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-gray-900">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Select a user to log in</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Close"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                This is a mock authentication system for demonstration purposes.
              </p>
              <div className="space-y-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleLogin(u.id)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Icon name="user" className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {u.ownedProducts.length} product{u.ownedProducts.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm"
      >
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <Icon name="user" className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
        <Icon name="chevron-down" className="w-4 h-4" />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 text-gray-900">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="text-xs text-gray-400 mt-1">
                {user.ownedProducts.length} product{user.ownedProducts.length !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Icon name="logout" className="w-4 h-4" />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
