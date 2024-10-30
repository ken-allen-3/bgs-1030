import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dice6, Library, UserCircle, Menu, X, LogOut, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={currentUser ? '/my-games' : '/'} className="flex items-center space-x-2">
            <Dice6 className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">BoardShare</span>
          </Link>
          
          {currentUser && (
            <button 
              className="p-2 text-gray-600 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}

          {!currentUser && (
            <Link 
              to="/login"
              className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600"
            >
              <UserCircle className="h-5 w-5" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {currentUser && isMenuOpen && (
          <div className="py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/my-games" 
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Library className="h-5 w-5" />
                <span>My Games</span>
              </Link>
              <Link 
                to="/borrow" 
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Dice6 className="h-5 w-5" />
                <span>Borrow</span>
              </Link>
              <Link 
                to="/groups" 
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Groups</span>
              </Link>
              {isAdmin && (
                <Link 
                  to="/users" 
                  className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 px-2 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Users className="h-5 w-5" />
                  <span>Manage Users</span>
                </Link>
              )}
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 px-2 py-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;