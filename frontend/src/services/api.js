const API_URL = 'http://localhost:5000/api';

// Simple wrapper around fetch to handle requests easily with auth token
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };

  // Do not set Content-Type if it is FormData (browser will set it automatically with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || 'Something went wrong';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error in ${endpoint}:`, error.message);
    throw error;
  }
};

const api = {
  // Auth endpoints
  auth: {
    register: (userData) => 
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    login: (credentials) => 
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    getMe: () => 
      request('/auth/me', {
        method: 'GET',
      }),
  },

  // User profiles & follow actions
  users: {
    getSuggestions: () => 
      request('/users', {
        method: 'GET',
      }),
    getProfile: (userId) => 
      request(`/users/${userId}`, {
        method: 'GET',
      }),
    updateProfile: (profileData) => 
      request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
    uploadAvatar: (formData) => 
      request('/users/profile/picture', {
        method: 'POST',
        body: formData, // Form data is passed directly (fetch sets boundary)
      }),
    toggleFollow: (userId) => 
      request(`/users/${userId}/follow`, {
        method: 'POST',
      }),
  },

  // Post CRUD, likes & comments
  posts: {
    getFeed: () => 
      request('/posts', {
        method: 'GET',
      }),
    getPost: (postId) => 
      request(`/posts/${postId}`, {
        method: 'GET',
      }),
    createPost: (formData) => 
      request('/posts', {
        method: 'POST',
        body: formData,
      }),
    updatePost: (postId, postData) => 
      request(`/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
      }),
    deletePost: (postId) => 
      request(`/posts/${postId}`, {
        method: 'DELETE',
      }),
    toggleLike: (postId) => 
      request(`/posts/${postId}/like`, {
        method: 'POST',
      }),
    addComment: (postId, commentData) => 
      request(`/posts/${postId}/comment`, {
        method: 'POST',
        body: JSON.stringify(commentData),
      }),
    deleteComment: (postId, commentId) => 
      request(`/posts/${postId}/comment/${commentId}`, {
        method: 'DELETE',
      }),
  },
};

export default api;
export { API_URL };
