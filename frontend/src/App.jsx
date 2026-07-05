import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, CheckCircle, X } from 'lucide-react';
import api from './services/api';
import Navbar from './components/Navbar';
import PostModal from './components/PostModal';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Profile from './pages/Profile';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Refresh feed trigger (used to coordinate between components)
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  // Toast System State
  const [toasts, setToasts] = useState([]);

  // Toast Helpers
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await api.auth.getMe();
          setCurrentUser(user);
        } catch (error) {
          console.log('Session expired or invalid token');
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, [refreshTrigger]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    addToast('Logged out successfully', 'success');
  };

  const handleEditClick = (post) => {
    setPostToEdit(post);
    setIsModalOpen(true);
  };

  const handleCreatePostClick = () => {
    setPostToEdit(null);
    setIsModalOpen(true);
  };

  // Save/Update Post handler
  const handleSavePost = async (formData, postId) => {
    if (postId) {
      // Editing: expects JSON content
      const content = formData.get('content');
      await api.posts.updatePost(postId, { content });
      addToast('Post updated successfully', 'success');
    } else {
      // Creating: expects multipart form data
      await api.posts.createPost(formData);
      addToast('Post created successfully', 'success');
    }
    triggerRefresh();
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Loader className="animate-spin" size={36} style={{ color: 'var(--accent)' }} />
        <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading SocialSphere...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        {currentUser && (
          <Navbar 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            onCreatePostClick={handleCreatePostClick}
          />
        )}
        
        <main className="main-content">
          <Routes>
            {/* Public route */}
            <Route 
              path="/login" 
              element={
                currentUser ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onAuthSuccess={(user) => setCurrentUser(user)} addToast={addToast} />
                )
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                currentUser ? (
                  <Feed 
                    currentUser={currentUser} 
                    onEditClick={handleEditClick} 
                    refreshTrigger={refreshTrigger}
                    triggerRefresh={triggerRefresh}
                    addToast={addToast}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/profile/:id" 
              element={
                currentUser ? (
                  <Profile 
                    currentUser={currentUser} 
                    onEditClick={handleEditClick}
                    triggerRefresh={triggerRefresh}
                    refreshTrigger={refreshTrigger}
                    addToast={addToast}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Post Create/Edit Modal */}
        <PostModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSavePost}
          postToEdit={postToEdit}
          addToast={addToast}
        />

        {/* Custom Toast Alert Popups */}
        <div className="alert-toast-container">
          {toasts.map((toast) => (
            <div 
              key={toast.id} 
              className={`toast toast-${toast.type}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {toast.type === 'success' ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{toast.message}</span>
              </div>
              <button 
                onClick={() => removeToast(toast.id)} 
                className="toast-close"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Router>
  );
};

export default App;
