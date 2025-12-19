// API base URL - change this in production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  full_name: string;
  username: string;
  student_id: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  full_name: string;
  username: string;
  student_id: string;
  email: string;
  phone: string | null;
  emergency_contact: string | null;
  avatar_url: string | null;
}

// Auth API functions
export const authApi = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  // Signup
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    return response.json();
  },

  // Get current user profile
  async getCurrentUser(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  },
};

// Token management
export const tokenManager = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Logout helper
  logout() {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
};
