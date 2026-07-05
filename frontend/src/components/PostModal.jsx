import React, { useState, useEffect, useRef } from 'react';
import { X, Image, Loader } from 'lucide-react';

const PostModal = ({ isOpen, onClose, onSave, postToEdit, addToast }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (postToEdit) {
      setContent(postToEdit.content || '');
      setImagePreview(postToEdit.image ? `http://localhost:5000${postToEdit.image}` : '');
      setImageFile(null);
    } else {
      setContent('');
      setImageFile(null);
      setImagePreview('');
    }
  }, [postToEdit, isOpen]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      addToast('Post content is required', 'danger');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await onSave(formData, postToEdit?._id);
      setContent('');
      setImageFile(null);
      setImagePreview('');
      onClose();
    } catch (error) {
      addToast(error.message || 'Error saving post', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{postToEdit ? 'Edit Post' : 'Create Post'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              className="form-control"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ minHeight: '120px', resize: 'vertical' }}
              disabled={loading}
              maxLength={1000}
            />
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {content.length}/1000 characters
            </div>
          </div>

          {/* Show image preview if exists (only allowed to add/upload on creation, or view/delete if editing - wait, for simplicity let's allow editing text content, or setting new image if creating) */}
          {!postToEdit && (
            <div className="form-group">
              <label>Add an image (optional)</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="file-input-wrapper">
                  <button type="button" className="btn btn-secondary">
                    <Image size={18} /> Choose Image
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {imagePreview && (
            <div className="image-preview-container" style={{ marginTop: '10px' }}>
              <img src={imagePreview} alt="Preview" className="image-preview" />
              {!postToEdit && (
                <button type="button" className="remove-image-btn" onClick={removeImage}>
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="animate-spin" size={16} /> Saving...
                </>
              ) : (
                'Publish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
