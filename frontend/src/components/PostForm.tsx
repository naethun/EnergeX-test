import React, { useState } from 'react';
import type { CreatePostData } from '../types';

interface PostFormProps {
  onSubmit: (data: CreatePostData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const PostForm: React.FC<PostFormProps> = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData).then(() => {
      setFormData({ title: '', content: '' });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <h3>Create New Post</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <input
        type="text"
        name="title"
        placeholder="Post Title"
        value={formData.title}
        onChange={handleChange}
        required
        disabled={isLoading}
      />
      
      <textarea
        name="content"
        placeholder="Post Content"
        value={formData.content}
        onChange={handleChange}
        rows={4}
        required
        disabled={isLoading}
      />
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
};