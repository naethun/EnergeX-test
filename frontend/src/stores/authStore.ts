import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthStore {
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.state = {
          user,
          token,
          isAuthenticated: true,
        };
      } catch {
        this.clearAuth();
      }
    }
  }

  private saveToLocalStorage() {
    if (this.state.token && this.state.user) {
      localStorage.setItem('auth_token', this.state.token);
      localStorage.setItem('auth_user', JSON.stringify(this.state.user));
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  getState(): AuthState {
    return { ...this.state };
  }

  setAuth(token: string, user: User) {
    this.state = {
      user,
      token,
      isAuthenticated: true,
    };
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  clearAuth() {
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false,
    };
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getToken(): string | null {
    return this.state.token;
  }

  getUser(): User | null {
    return this.state.user;
  }

  isLoggedIn(): boolean {
    return this.state.isAuthenticated;
  }
}

export const authStore = new AuthStore();