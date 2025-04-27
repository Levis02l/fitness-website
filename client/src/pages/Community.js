import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  IconButton,
  Grid,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Comment, 
  Delete, 
  Image as ImageIcon,
  Close
} from '@mui/icons-material';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';

// ✅ 加这一行：设置图片服务器地址
const BASE_URL = 'http://localhost:5000';  // 本地开发用 localhost:5000

const CreatePostCard = ({ onPostCreated }) => {
  // 你原来代码不动
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      setError('Maximum 4 images allowed');
      return;
    }
    const newImages = [...images, ...files];
    setImages(newImages);
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      setError('Please enter text or upload at least one image');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      if (content.trim()) {
        formData.append('content', content);
      }
      images.forEach(image => {
        formData.append('images', image);
      });

      await API.post('/community', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setContent('');
      setImages([]);
      setImagePreviews([]);
      onPostCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* 你自己原来的UI */}
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Share your fitness journey..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {imagePreviews.map((preview, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box position="relative">
                <CardMedia
                  component="img"
                  image={preview}
                  alt={`Preview ${index + 1}`}
                  sx={{ height: 100, objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            component="label"
            startIcon={<ImageIcon />}
            variant="outlined"
            disabled={images.length >= 4}
          >
            Upload Images
            <input
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && images.length === 0)}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </Box>
        
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const PostCard = ({ post, onLike, onComment, onDelete, currentUserId }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  // 添加调试日志
  console.log('Post user_id:', post.user_id);
  console.log('Current user_id:', currentUserId);

  const canDelete = currentUserId && post.user_id && currentUserId === post.user_id;

  useEffect(() => {
    if (post) {
      setIsLiked(post.is_liked || false);
      setComments(post.comments || []);
    }
  }, [post]);

  const handleLike = async () => {
    try {
      const response = await API.post(`/community/${post.id}/like`);
      setIsLiked(response.data.liked);
      onLike(post.id, response.data.liked);
    } catch (err) {
      setError('Failed to like, please try again');
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      await API.post(`/community/${post.id}/comment`, {
        comment_text: commentText
      });
      setCommentText('');
      // 刷新评论列表
      const updatedPost = await API.get(`/community/${post.id}`);
      setComments(updatedPost.data.comments);
      onComment(post.id);
    } catch (err) {
      setError('Failed to comment, please try again');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await API.delete(`/community/comment/${commentId}`);
      // 刷新评论列表
      const updatedPost = await API.get(`/community/${post.id}`);
      setComments(updatedPost.data.comments);
    } catch (err) {
      setError('Failed to delete comment, please try again');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await API.delete(`/community/${post.id}`);
        onDelete(post.id);
      } catch (err) {
        setError('Failed to delete post, please try again');
      }
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar src={post.avatar} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="subtitle1">{post.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.created_at).toLocaleString()}
            </Typography>
          </Box>
          {canDelete && (
            <IconButton
              onClick={handleDelete}
              sx={{ ml: 'auto' }}
              color="error"
              size="small"
            >
              <Delete />
            </IconButton>
          )}
        </Box>

        {post.content && (
          <Typography paragraph>
            {post.content}
          </Typography>
        )}

        {post.images && post.images.length > 0 && (
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {post.images.map((image, index) => (
              <Grid item xs={6} sm={4} key={index}>
                <CardMedia
                  component="img"
                  image={`${BASE_URL}${image}`}
                  alt={`Image ${index + 1}`}
                  sx={{ height: 200, objectFit: 'cover' }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <CardActions>
          <IconButton onClick={handleLike}>
            {isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
          <IconButton onClick={() => setShowComments(!showComments)}>
            <Comment />
          </IconButton>
        </CardActions>

        {showComments && (
          <Box mt={2}>
            <TextField
              fullWidth
              placeholder="Write your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleComment}
              disabled={!commentText.trim()}
            >
              Comment
            </Button>

            {comments.map((comment) => (
              <Box key={comment.id} mt={2} display="flex" alignItems="center">
                <Avatar src={comment.avatar} sx={{ mr: 1 }} />
                <Box flex={1}>
                  <Typography variant="subtitle2">{comment.username}</Typography>
                  <Typography variant="body2">{comment.comment_text}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.created_at).toLocaleString()}
                  </Typography>
                </Box>
                {currentUserId === comment.user_id && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteComment(comment.id)}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const Community = () => {
  const { currentUser: user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await API.get(`/community?page=${pageNum}`);
      const newPosts = await Promise.all(
        response.data.posts.map(async (post) => {
          const postDetail = await API.get(`/community/${post.id}`);
          return {
            ...post,
            comments: postDetail.data.comments || [],
            is_liked: postDetail.data.is_liked || false,
            user_id: post.user_id  // 确保user_id被包含
          };
        })
      );
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to load posts, please try again',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handlePostCreated = () => {
    setPage(1);
    fetchPosts(1);
    setSnackbar({
      open: true,
      message: 'Post created successfully',
      severity: 'success'
    });
  };

  const handleLike = async (postId, liked) => {
    try {
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, is_liked: liked } : post
      ));
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update like status',
        severity: 'error'
      });
    }
  };

  const handleComment = async (postId) => {
    try {
      const response = await API.get(`/community/${postId}`);
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, comments: response.data.comments } : post
      ));
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update comments',
        severity: 'error'
      });
    }
  };

  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    setSnackbar({
      open: true,
      message: 'Post deleted successfully',
      severity: 'success'
    });
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Community Feed
      </Typography>

      <CreatePostCard onPostCreated={handlePostCreated} />

      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onDelete={handleDelete}
          currentUserId={user?.id || null}
        />
      ))}

      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {!loading && hasMore && (
        <Box display="flex" justifyContent="center" my={3}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
          >
            Load More
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Community;
