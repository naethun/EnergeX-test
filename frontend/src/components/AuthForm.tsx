import React, { useState } from 'react';
import type { LoginCredentials } from '../types';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      email: formData.email,
      password: formData.password,
    });
  };

  const isRegister = mode === 'register';

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        disabled={isLoading}
      />
      
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        disabled={isLoading}
      />
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
      </button>
    </form>
  );
};