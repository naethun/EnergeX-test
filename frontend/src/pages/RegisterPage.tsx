import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { authAPI } from '../utils/api';
import { authStore } from '../stores/authStore';
import { getApiError } from '../utils/error';
import type { LoginCredentials } from '../types';

export const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authAPI.register(credentials);
      authStore.setAuth(response.access_token, response.user);
      
      navigate('/posts');
    } catch (err: unknown) {
      setError(getApiError(err) || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <AuthForm
          mode="register"
          onSubmit={handleRegister}
          isLoading={isLoading}
          error={error}
        />
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};