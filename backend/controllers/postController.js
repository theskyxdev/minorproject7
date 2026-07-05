const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/posts/${req.file.filename}`;
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      image: imagePath,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username profilePicture');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ message: 'Server Error during post creation', error: error.message });
  }
};

// @desc    Get all posts (Feed)
// @route   GET /api/posts
// @access  Private
const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username profilePicture');

    res.json(posts);
  } catch (error) {
    console.error('Get Feed Posts Error:', error);
    res.status(500).json({ message: 'Server Error fetching feed', error: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get Post By ID Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user's own post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to edit this post' });
    }

    if (content !== undefined) {
      post.content = content;
    }

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id)
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username profilePicture');

    res.json(populatedPost);
  } catch (error) {
    console.error('Update Post Error:', error);
    res.status(500).json({ message: 'Server Error during post update', error: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    // Delete post image file if exists
    if (post.image && post.image.startsWith('/uploads/posts/')) {
      const imgPath = path.join(__dirname, '..', post.image);
      fs.unlink(imgPath, (err) => {
        if (err) console.log('Error deleting post image:', err.message);
      });
    }

    await Post.deleteOne({ _id: post._id });

    res.json({ message: 'Post deleted successfully', postId: post._id });
  } catch (error) {
    console.error('Delete Post Error:', error);
    res.status(500).json({ message: 'Server Error during post deletion', error: error.message });
  }
};

// @desc    Like / unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike post
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      // Like post
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Like Post Error:', error);
    res.status(500).json({ message: 'Server Error during like toggle', error: error.message });
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
const commentPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const comment = {
      author: req.user._id,
      content,
    };

    post.comments.push(comment);
    await post.save();

    // Get fully populated comments
    const updatedPost = await Post.findById(post._id)
      .populate('comments.author', 'username profilePicture');

    res.json({ comments: updatedPost.comments });
  } catch (error) {
    console.error('Comment Post Error:', error);
    res.status(500).json({ message: 'Server Error during comment creation', error: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Verify ownership: either the comment author or the post author can delete it
    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'User not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();

    // Get fully populated comments
    const updatedPost = await Post.findById(post._id)
      .populate('comments.author', 'username profilePicture');

    res.json({ comments: updatedPost.comments });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    res.status(500).json({ message: 'Server Error during comment deletion', error: error.message });
  }
};

module.exports = {
  createPost,
  getFeedPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentPost,
  deleteComment,
};
