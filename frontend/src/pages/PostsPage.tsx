import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostList } from '../components/PostList';
import { PostForm } from '../components/PostForm';
import { authStore } from '../stores/authStore';
import { postsAPI } from '../utils/api';
import { getApiError } from '../utils/error';
import type { CreatePostData, User } from '../types';

export const PostsPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setUser(authStore.getUser());
    });

    setUser(authStore.getUser());

    return unsubscribe;
  }, []);

  const handleCreatePost = async (postData: CreatePostData) => {
    try {
      setIsCreatingPost(true);
      setCreateError(null);
      
      await postsAPI.createPost(postData);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: unknown) {
      setCreateError(getApiError(err) || 'Failed to create post');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleLogout = () => {
    authStore.clearAuth();
    navigate('/login');
  };

  return (
    <div className="posts-page">
      <header className="posts-header">
        <div className="header-content">
          <h1>EnergeX Posts</h1>
          {user && (
            <div className="user-info">
              <span>Welcome, {user.name}!</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="posts-content">
        <div className="create-post-section">
          <PostForm
            onSubmit={handleCreatePost}
            isLoading={isCreatingPost}
            error={createError}
          />
        </div>

        <div className="posts-list-section">
          <PostList refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
};