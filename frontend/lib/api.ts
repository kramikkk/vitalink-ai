// API base URL - change this in production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// User roles enum
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

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
  role: UserRole;
}

export interface UserProfile {
  id: number;
  full_name: string;
  username: string;
  student_id: string | null;
  admin_id: string | null;
  email: string;
  phone: string | null;
  emergency_contact: string | null;
  avatar_url: string | null;
  role: UserRole;
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
      credentials: 'include',
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
      credentials: 'include',
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

  // Get all students (admin only)
  async getStudents(token: string): Promise<UserProfile[]> {
    const response = await fetch(`${API_BASE_URL}/auth/students`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }

    return response.json();
  },

  // Get all admins (admin/super admin only)
  async getAdmins(token: string): Promise<UserProfile[]> {
    const response = await fetch(`${API_BASE_URL}/auth/admins`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch admins');
    }

    return response.json();
  },

  // Get all super admins (admin/super admin only)
  async getSuperAdmins(token: string): Promise<UserProfile[]> {
    const response = await fetch(`${API_BASE_URL}/auth/super-admins`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch super admins');
    }

    return response.json();
  },

  // Delete a user (admin/super admin only)
  async deleteUser(userId: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete user');
    }
  },
};

// Token management
export const tokenManager = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      // Set expiration time (30 minutes from now)
      const expiresAt = Date.now() + 30 * 60 * 1000;
      localStorage.setItem('token_expires_at', expiresAt.toString());
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const expiresAt = localStorage.getItem('token_expires_at');

      // Check if token is expired
      if (token && expiresAt && Date.now() >= parseInt(expiresAt)) {
        this.removeToken();
        return null;
      }

      return token;
    }
    return null;
  },

  setRole(role: UserRole) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_role', role);
    }
  },

  getRole(): UserRole | null {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('user_role');
      return role as UserRole | null;
    }
    return null;
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('token_expires_at');
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isTokenExpiringSoon(): boolean {
    if (typeof window === 'undefined') return false;

    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return false;

    // Check if token expires in less than 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() >= parseInt(expiresAt) - fiveMinutes;
  },

  async refreshToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token);
        this.setRole(data.role);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  },

  logout() {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
};

// Metrics types
export interface MetricData {
  id: number;
  heart_rate: number;
  motion_intensity: number;
  prediction: string;
  anomaly_score: number;
  confidence_normal: number;
  confidence_anomaly: number;
  timestamp: string;
}

// Metrics API functions
export const metricsApi = {
  // Get latest metrics for current user
  async getLatestMetrics(token: string): Promise<MetricData[]> {
    const response = await fetch(`${API_BASE_URL}/metrics/latest`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No data available yet
      }
      throw new Error('Failed to fetch metrics');
    }

    return response.json();
  },

  // Get metrics history with time range
  async getMetricsHistory(
    token: string,
    startTime?: string,
    endTime?: string,
    limit?: number
  ): Promise<MetricData[]> {
    const params = new URLSearchParams();
    if (startTime) params.append('start_time', startTime);
    if (endTime) params.append('end_time', endTime);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/metrics/history?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No data available yet
      }
      throw new Error('Failed to fetch metrics history');
    }

    return response.json();
  },
  
  // Get latest metrics for a specific student (admin only)
  async getStudentLatestMetrics(token: string, studentId: number): Promise<MetricData[]> {
    const response = await fetch(`${API_BASE_URL}/metrics/student/${studentId}/latest`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No data available yet
      }
      throw new Error('Failed to fetch student metrics');
    }

    return response.json();
  },

  // Get metrics history for a specific student (admin only)
  async getStudentMetricsHistory(
    token: string,
    studentId: number,
    startTime?: string,
    endTime?: string,
    limit?: number
  ): Promise<MetricData[]> {
    const params = new URLSearchParams();
    if (startTime) params.append('start_time', startTime);
    if (endTime) params.append('end_time', endTime);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/metrics/student/${studentId}/history?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No data available yet
      }
      throw new Error('Failed to fetch student metrics history');
    }

    return response.json();
  },
};
