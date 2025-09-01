// API service for communicating with Django backend
const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Books API
  async getBooks(params?: {
    search?: string;
    category?: string;
    available_only?: boolean;
    sort_by?: string;
  }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.available_only) searchParams.append('available_only', 'true');
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    
    const query = searchParams.toString();
    return this.request(`/books/${query ? `?${query}` : ''}`);
  }

  async getBook(id: string): Promise<any> {
    return this.request(`/books/${id}/`);
  }

  async createBook(bookData: any): Promise<any> {
    return this.request('/books/', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(id: string, bookData: any): Promise<any> {
    return this.request(`/books/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  }

  async deleteBook(id: string): Promise<void> {
    return this.request(`/books/${id}/`, {
      method: 'DELETE',
    });
  }

  async borrowBook(bookId: string, userId: string): Promise<any> {
    return this.request(`/books/${bookId}/borrow/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getPopularBooks(): Promise<any[]> {
    return this.request('/books/popular/');
  }

  // Categories API
  async getCategories(search?: string): Promise<any[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/categories/${query}`);
  }

  async getCategoriesWithStats(): Promise<any[]> {
    return this.request('/categories/stats/');
  }

  async createCategory(categoryData: any): Promise<any> {
    return this.request('/categories/', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: any): Promise<any> {
    return this.request(`/categories/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request(`/categories/${id}/`, {
      method: 'DELETE',
    });
  }

  // Users API
  async getUsers(params?: {
    search?: string;
    role?: string;
    active_only?: boolean;
  }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.active_only) searchParams.append('active_only', 'true');
    
    const query = searchParams.toString();
    return this.request(`/users/${query ? `?${query}` : ''}`);
  }

  async getUser(id: string): Promise<any> {
    return this.request(`/users/${id}/`);
  }

  async createUser(userData: any): Promise<any> {
    return this.request('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any): Promise<any> {
    return this.request(`/users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}/`, {
      method: 'DELETE',
    });
  }

  async getUserBorrowedBooks(userId: string): Promise<any[]> {
    return this.request(`/users/${userId}/borrowed_books/`);
  }

  async payUserFine(userId: string, amount: number): Promise<any> {
    return this.request(`/users/${userId}/pay_fine/`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Transactions API
  async getTransactions(params?: {
    user_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.user_id) searchParams.append('user_id', params.user_id);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    
    const query = searchParams.toString();
    return this.request(`/transactions/${query ? `?${query}` : ''}`);
  }

  async returnBook(transactionId: string): Promise<any> {
    return this.request(`/transactions/${transactionId}/return_book/`, {
      method: 'POST',
    });
  }

  async getOverdueTransactions(): Promise<any[]> {
    return this.request('/transactions/overdue/');
  }

  async getAnalytics(): Promise<any> {
    return this.request('/transactions/analytics/');
  }
}

export const apiService = new ApiService();