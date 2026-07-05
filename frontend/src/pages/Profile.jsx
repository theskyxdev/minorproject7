import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Camera, Edit, UserCheck, UserPlus, LogOut, ArrowLeft, Loader, Settings } from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/PostCard';

const Profile = ({ currentUser, onEditClick, triggerRefresh, refreshTrigger, addToast }) => {
  const { id: profileUserId } = useParams();
  const isOwnProfile = currentUser?._id === profileUserId;

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Edit profile states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const avatarInputRef = useRef(null);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const data = await api.users.getProfile(profileUserId);
      setProfileUser(data.user);
      setPosts(data.posts);
      // Initialize edit fields
      setEditUsername(data.user.username);
      setEditBio(data.user.bio || '');
    } catch (error) {
      addToast(error.message || 'Error loading profile details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileUserId) {
      fetchProfileData();
    }
  }, [profileUserId, refreshTrigger]);

  const handleLikeUpdate = (postId, newLikes) => {
    setPosts(prevPosts =>
      prevPosts.map(post => (post._id === postId ? { ...post, likes: newLikes } : post))
    );
  };

  const handlePostDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.posts.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      addToast('Post deleted', 'success');
      triggerRefresh(); // Refresh suggestions/counts
    } catch (error) {
      addToast(error.message || 'Error deleting post', 'danger');
    }
  };

  const handleFollowToggle = async () => {
    try {
      const data = await api.users.toggleFollow(profileUserId);
      addToast(data.message, 'success');
      // Update follow stats locally
      fetchProfileData();
      triggerRefresh(); // Refresh suggestions/navbar statistics
    } catch (error) {
      addToast(error.message || 'Error following user', 'danger');
    }
  };

  const handleAvatarUploadClick = () => {
    if (isOwnProfile && avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('File must be smaller than 5MB', 'danger');
        return;
      }
      
      const formData = new FormData();
      formData.append('image', file);

      setUpdatingProfile(true);
      try {
        const data = await api.users.uploadAvatar(formData);
        addToast(data.message, 'success');
        // Update user stats globally
        triggerRefresh();
      } catch (error) {
        addToast(error.message || 'Error uploading avatar', 'danger');
      } finally {
        setUpdatingProfile(false);
      }
    }
  };

  const handleSaveProfileDetails = async (e) => {
    e.preventDefault();
    if (!editUsername.trim()) {
      addToast('Username cannot be empty', 'danger');
      return;
    }

    setUpdatingProfile(true);
    try {
      await api.users.updateProfile({ username: editUsername, bio: editBio });
      addToast('Profile updated successfully!', 'success');
      setShowEditModal(false);
      triggerRefresh();
    } catch (error) {
      addToast(error.message || 'Error updating profile details', 'danger');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getAvatarUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';
    return `http://localhost:5000${path}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>User Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>The user you are trying to view does not exist.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Go to Feed
        </Link>
      </div>
    );
  }

  const isFollowing = currentUser?.following?.includes(profileUserId);

  return (
    <div className="profile-container">
      {/* Banner / Cover Header Card */}
      <div className="card profile-header-card">
        <div className="profile-cover" />
        <div className="profile-info-row">
          <div 
            className="profile-avatar-wrapper"
            onClick={handleAvatarUploadClick}
            title={isOwnProfile ? 'Click to change profile picture' : ''}
          >
            <img
              src={getAvatarUrl(profileUser.profilePicture)}
              alt={profileUser.username}
              className="avatar-large"
            />
            {isOwnProfile && (
              <div className="profile-avatar-overlay">
                {updatingProfile ? <Loader className="animate-spin" size={20} /> : <Camera size={20} />}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
              disabled={updatingProfile}
            />
          </div>

          <div className="profile-user-details">
            <h1 className="profile-name">{profileUser.username}</h1>
            <span className="profile-username">{profileUser.email}</span>
            {profileUser.bio ? (
              <p className="profile-bio">{profileUser.bio}</p>
            ) : (
              <p className="profile-bio" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No bio set yet.</p>
            )}

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{profileUser.following?.length || 0}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{profileUser.followers?.length || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{posts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {isOwnProfile ? (
              <button 
                onClick={() => setShowEditModal(true)} 
                className="btn btn-secondary"
              >
                <Edit size={16} /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} /> Following
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Follow
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User's Posts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          {isOwnProfile ? 'My Posts' : `${profileUser.username}'s Posts`}
        </h2>

        {posts.length > 0 ? (
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
            <p style={{ color: 'var(--text-secondary)' }}>No posts published yet.</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="btn-icon" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfileDetails}>
              <div className="form-group">
                <label htmlFor="edit-username">Username</label>
                <input
                  id="edit-username"
                  type="text"
                  className="form-control"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  disabled={updatingProfile}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-bio">Bio</label>
                <textarea
                  id="edit-bio"
                  className="form-control"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  disabled={updatingProfile}
                  placeholder="Tell us about yourself..."
                  maxLength={160}
                />
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {editBio.length}/160 characters
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={updatingProfile}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
                  {updatingProfile ? <Loader className="animate-spin" size={16} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
