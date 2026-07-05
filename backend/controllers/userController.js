const User = require('../models/User');
const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

// @desc    Get all users (suggestions for feed sidebar)
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    // Return users, excluding the current logged-in user and their password
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .limit(10);
    res.json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user profile details
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get posts from this user
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username profilePicture');

    res.json({
      user,
      posts,
    });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile bio & details
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate unique username if it is being changed
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      followers: updatedUser.followers,
      following: updatedUser.following,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server Error during profile update', error: error.message });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile/picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if exists locally
    if (user.profilePicture && user.profilePicture.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(__dirname, '..', user.profilePicture);
      fs.unlink(oldPath, (err) => {
        if (err) console.log('Error deleting old avatar:', err.message);
      });
    }

    // Save path in user model
    user.profilePicture = `/uploads/avatars/${req.file.filename}`;
    const updatedUser = await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    console.error('Upload Avatar Error:', error);
    res.status(500).json({ message: 'Server Error during avatar upload', error: error.message });
  }
};

// @desc    Follow / Unfollow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow logic
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId.toString()
      );
      await currentUser.save();
      await targetUser.save();
      res.json({ isFollowing: false, message: `Unfollowed ${targetUser.username}` });
    } else {
      // Follow logic
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();
      res.json({ isFollowing: true, message: `Followed ${targetUser.username}` });
    }
  } catch (error) {
    console.error('Follow User Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  followUser,
};
