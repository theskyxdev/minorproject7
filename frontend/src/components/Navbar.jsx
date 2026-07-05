import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, PlusSquare, Share2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ currentUser, onLogout, onCreatePostClick }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const getAvatarUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';
    return `http://localhost:5000${path}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Share2 className="gradient-text" size={28} />
          <span className="gradient-text">SocialSphere</span>
        </Link>

        {currentUser && (
          <div className="navbar-menu">
            <Link to="/" className="btn-icon" title="Home Feed">
              <Home size={20} />
            </Link>

            <button 
              onClick={onCreatePostClick} 
              className="btn-icon" 
              title="Create Post"
            >
              <PlusSquare size={20} />
            </button>

            <ThemeToggle />

            <Link 
              to={`/profile/${currentUser._id}`} 
              className="navbar-user"
              title="My Profile"
            >
              <img 
                src={getAvatarUrl(currentUser.profilePicture)} 
                alt={currentUser.username} 
                className="avatar"
              />
              <span style={{ display: 'none' }} className="username-text">
                {currentUser.username}
              </span>
            </Link>

            <button 
              onClick={handleLogoutClick} 
              className="btn-icon" 
              style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
