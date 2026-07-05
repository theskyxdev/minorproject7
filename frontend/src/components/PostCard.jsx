import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Edit3, Trash2, Send, X } from 'lucide-react';
import api from '../services/api';

const PostCard = ({ post, currentUser, onLike, onDelete, onEditClick, addToast }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  const isLiked = post.likes.includes(currentUser?._id);
  const isAuthor = post.author._id === currentUser?._id;

  const handleLikeClick = async () => {
    try {
      const data = await api.posts.toggleLike(post._id);
      // Callback to update post state in parent (Feed/Profile)
      onLike(post._id, data.likes);
    } catch (error) {
      addToast(error.message || 'Error liking post', 'danger');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const data = await api.posts.addComment(post._id, { content: newComment });
      setComments(data.comments);
      setNewComment('');
      // Update comment count locally in parent if needed (handled simply here)
      post.comments = data.comments; 
      addToast('Comment added successfully', 'success');
    } catch (error) {
      addToast(error.message || 'Error adding comment', 'danger');
    } finally {
      setCommenting(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const data = await api.posts.deleteComment(post._id, commentId);
      setComments(data.comments);
      post.comments = data.comments;
      addToast('Comment deleted', 'success');
    } catch (error) {
      addToast(error.message || 'Error deleting comment', 'danger');
    }
  };

  const getAvatarUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';
    return `http://localhost:5000${path}`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <article className="card post-card">
      <div className="post-header">
        <div className="post-author-info">
          <Link to={`/profile/${post.author._id}`}>
            <img
              src={getAvatarUrl(post.author.profilePicture)}
              alt={post.author.username}
              className="avatar"
            />
          </Link>
          <div className="post-meta">
            <Link to={`/profile/${post.author._id}`} className="post-author-name">
              {post.author.username}
            </Link>
            <span className="post-time">{formatDate(post.createdAt)}</span>
          </div>
        </div>

        {isAuthor && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onEditClick(post)}
              className="btn-icon"
              style={{ width: '32px', height: '32px' }}
              title="Edit Post"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(post._id)}
              className="btn-icon"
              style={{ width: '32px', height: '32px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
              title="Delete Post"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {post.image && (
        <img
          src={`http://localhost:5000${post.image}`}
          alt="Post attached graphic"
          className="post-image"
          loading="lazy"
        />
      )}

      <div className="post-footer">
        <button
          onClick={handleLikeClick}
          className={`post-action-btn ${isLiked ? 'liked' : ''}`}
        >
          <Heart size={18} />
          <span>{post.likes.length} Likes</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="post-action-btn"
        >
          <MessageSquare size={18} />
          <span>{comments.length} Comments</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {comments.length > 0 ? (
            <div className="comment-list">
              {comments.map((comment) => {
                const isCommentAuthor = comment.author._id === currentUser?._id;
                const isPostAuthor = post.author._id === currentUser?._id;
                return (
                  <div key={comment._id} className="comment-item">
                    <Link to={`/profile/${comment.author._id}`}>
                      <img
                        src={getAvatarUrl(comment.author.profilePicture)}
                        alt={comment.author.username}
                        className="avatar"
                        style={{ width: '28px', height: '28px' }}
                      />
                    </Link>
                    <div className="comment-content-box">
                      <div className="comment-header">
                        <Link to={`/profile/${comment.author._id}`} className="comment-author-name">
                          {comment.author.username}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="comment-time">{formatDate(comment.createdAt)}</span>
                          {(isCommentAuthor || isPostAuthor) && (
                            <button
                              onClick={() => handleCommentDelete(comment._id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              title="Delete Comment"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
              No comments yet. Be the first to comment!
            </p>
          )}

          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              className="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={commenting}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 12px', borderRadius: '30px' }}
              disabled={commenting || !newComment.trim()}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

export default PostCard;
