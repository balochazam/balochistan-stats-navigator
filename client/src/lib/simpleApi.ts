// Simple API client for session-based authentication
const API_BASE = '';

class SimpleApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('bbos_auth_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for session-based auth
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      const errorMsg = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return null;
    }

    return JSON.parse(text);
  }

  // Auth methods
  async register(email: string, password: string, fullName: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  }

  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data?.session?.access_token || data?.user?.id) {
      const token = data.session?.access_token || data.user?.id;
      localStorage.setItem('bbos_auth_token', token);
      if (data.user) localStorage.setItem('bbos_auth_user', JSON.stringify(data.user));
      if (data.profile) localStorage.setItem('bbos_auth_profile', JSON.stringify(data.profile));
    }

    return data;
  }

  async logout() {
    try {
      return await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('bbos_auth_token');
      localStorage.removeItem('bbos_auth_user');
      localStorage.removeItem('bbos_auth_profile');
    }
  }

  async getCurrentUser() {
    return this.request('/api/auth/user');
  }

  // Data methods
  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const simpleApiClient = new SimpleApiClient();