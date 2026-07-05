const express = require('express');
const {
  createPost,
  getFeedPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentPost,
  deleteComment,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { uploadPost } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, uploadPost.single('image'), createPost);
router.get('/', protect, getFeedPosts);
router.get('/:id', protect, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);
router.delete('/:id/comment/:commentId', protect, deleteComment);

module.exports = router;
