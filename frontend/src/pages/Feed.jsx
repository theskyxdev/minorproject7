import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Image, X, Send, UserCheck, UserPlus, Loader } from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/PostCard';

const Feed = ({ currentUser, onEditClick, refreshTrigger, triggerRefresh, addToast }) => {
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // Inline Quick Post states
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch feed and suggestions
  const fetchFeedData = async () => {
    setLoadingPosts(true);
    try {
      const feedPosts = await api.posts.getFeed();
      setPosts(feedPosts);
    } catch (error) {
      addToast(error.message || 'Failed to load posts feed', 'danger');
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const users = await api.users.getSuggestions();
      setSuggestions(users);
    } catch (error) {
      console.log('Failed to fetch suggestions:', error.message);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFeedData();
      fetchSuggestions();
    }
  }, [currentUser, refreshTrigger]);

  // Handle Likes locally to prevent full refetches
  const handleLikeUpdate = (postId, newLikes) => {
    setPosts(prevPosts =>
      prevPosts.map(post => (post._id === postId ? { ...post, likes: newLikes } : post))
    );
  };

  // Delete Post
  const handlePostDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.posts.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      addToast('Post deleted successfully', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to delete post', 'danger');
    }
  };

  // Image Upload for Inline post box
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('File size must be less than 5MB', 'danger');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Create Post Submit
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      addToast('Post content cannot be empty', 'danger');
      return;
    }

    setCreatingPost(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const newPost = await api.posts.createPost(formData);
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setContent('');
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      addToast('Post published!', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to create post', 'danger');
    } finally {
      setCreatingPost(false);
    }
  };

  // Toggle follow action from sidebar suggestions
  const handleFollowToggle = async (userId) => {
    try {
      const data = await api.users.toggleFollow(userId);
      addToast(data.message, 'success');
      
      // Refresh suggestions and feed (since posts might change based on who they follow - or just refresh suggestion state)
      fetchSuggestions();
      triggerRefresh(); // Refresh parent user profile stats and feed
    } catch (error) {
      addToast(error.message || 'Error following user', 'danger');
    }
  };

  const getAvatarUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';
    return `http://localhost:5000${path}`;
  };

  return (
    <div className="feed-layout">
      {/* Left Sidebar - Current User Info */}
      <aside className="sidebar-left">
        {currentUser && (
          <div className="card sidebar-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
              <Link to={`/profile/${currentUser._id}`}>
                <img
                  src={getAvatarUrl(currentUser.profilePicture)}
                  alt={currentUser.username}
                  className="avatar-large"
                  style={{ width: '70px', height: '70px' }}
                />
              </Link>
              <div>
                <Link to={`/profile/${currentUser._id}`} style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                  {currentUser.username}
                </Link>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentUser.email}</p>
              </div>
              {currentUser.bio && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', width: '100%', paddingTop: '8px' }}>
                  "{currentUser.bio}"
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border-color)', paddingTop: '12px', width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontWeight: '700' }}>{currentUser.following?.length || 0}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Following</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontWeight: '700' }}>{currentUser.followers?.length || 0}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Followers</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Feed Column */}
      <main className="feed-column">
        {/* Create Post Card */}
        <div className="card create-post-card">
          <form onSubmit={handleCreatePost}>
            <div className="create-post-input-row">
              <img
                src={getAvatarUrl(currentUser?.profilePicture)}
                alt="Avatar"
                className="avatar"
              />
              <textarea
                placeholder="Share something with the world..."
                className="create-post-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={creatingPost}
              />
            </div>

            {imagePreview && (
              <div className="image-preview-container" style={{ margin: '12px 0 0 50px' }}>
                <img src={imagePreview} alt="Upload preview" className="image-preview" />
                <button type="button" className="remove-image-btn" onClick={removeImage}>
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="create-post-actions" style={{ marginLeft: '50px' }}>
              <div className="file-input-wrapper">
                <button type="button" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                  <Image size={16} /> Image
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  disabled={creatingPost}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                disabled={creatingPost || !content.trim()}
              >
                {creatingPost ? <Loader className="animate-spin" size={16} /> : 'Share'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        {loadingPosts ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[1, 2].map(n => (
              <div key={n} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div className="skeleton skeleton-avatar" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '20%' }} />
                  </div>
                </div>
                <div className="skeleton skeleton-text" style={{ width: '100%', height: '32px' }} />
                <div className="skeleton skeleton-image" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              onLike={handleLikeUpdate}
              onDelete={handlePostDelete}
              onEditClick={onEditClick}
              addToast={addToast}
            />
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No posts in your feed yet.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Follow other users or create your first post to see content!</p>
          </div>
        )}
      </main>

      {/* Right Sidebar - Suggestions */}
      <aside className="sidebar-right" style={{ display: 'none' }}>
        {/* On desktops we will display this. Styled media query will display it */}
        <div className="card sidebar-panel" style={{ padding: '20px' }}>
          <h3 className="sidebar-title">Who to Follow</h3>
          {loadingSuggestions ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div className="skeleton skeleton-avatar" style={{ width: '32px', height: '32px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '50%', height: '12px' }} />
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {suggestions.map(user => {
                const isUserFollowed = currentUser?.following?.includes(user._id);
                return (
                  <div key={user._id} className="user-item">
                    <div className="user-item-info">
                      <Link to={`/profile/${user._id}`}>
                        <img
                          src={getAvatarUrl(user.profilePicture)}
                          alt={user.username}
                          className="avatar"
                          style={{ width: '32px', height: '32px' }}
                        />
                      </Link>
                      <div className="user-item-details">
                        <Link to={`/profile/${user._id}`} className="user-item-name">
                          {user.username}
                        </Link>
                        <span className="user-item-username" style={{ fontSize: '0.75rem' }}>
                          {user.followers?.length || 0} followers
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFollowToggle(user._id)}
                      className={`btn ${isUserFollowed ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '20px' }}
                    >
                      {isUserFollowed ? <UserCheck size={12} /> : <UserPlus size={12} />}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No suggestions available</p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Feed;
