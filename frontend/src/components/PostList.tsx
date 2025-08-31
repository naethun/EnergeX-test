import React, { useState, useEffect } from 'react';
import type { Post } from '../types';
import { postsAPI } from '../utils/api';

interface PostListProps {
  refreshTrigger: number;
}

export const PostList: React.FC<PostListProps> = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const postsData = await postsAPI.getPosts();
      setPosts(postsData);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [refreshTrigger]);

  if (isLoading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={loadPosts}>Retry</button>
      </div>
    );
  }

  return (
    <div className="post-list">
      <h3>Posts</h3>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to create one!</p>
      ) : (
        <div className="posts">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <h4>{post.title}</h4>
              <p>{post.content}</p>
              <div className="post-meta">
                {post.created_at && (
                  <small>Created: {new Date(post.created_at).toLocaleDateString()}</small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={loadPosts} className="refresh-button">
        Refresh Posts
      </button>
    </div>
  );
};