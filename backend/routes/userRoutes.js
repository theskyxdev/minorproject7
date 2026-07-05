const express = require('express');
const {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  followUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/profile/picture', protect, uploadAvatar.single('image'), uploadProfilePicture);
router.post('/:id/follow', protect, followUser);

module.exports = router;
