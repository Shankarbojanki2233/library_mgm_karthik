export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  subCategory: string;
  publisher: string;
  year: number;
  copies: number;
  available: number;
  location: string;
  description: string;
  tags: string[];
  rating: number;
  popularity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  employeeId?: string;
  department: string;
  year?: number;
  role: 'student' | 'admin';
  joinDate: string;
  phone: string;
  address: string;
  fines?: number;
  borrowingHistory?: string[];
  permissions?: string[];
}

export interface Category {
  id: string;
  name: string;
  subCategories: string[];
  code: string;
  description: string;
}

export interface Transaction {
  id: string;
  userId: string;
  bookId: string;
  type: 'borrow' | 'return' | 'renew';
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'borrowed' | 'returned' | 'overdue';
  fineAmount: number;
  renewalCount: number;
}

export interface LibraryStats {
  totalBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
  totalUsers: number;
  totalFines: number;
  popularCategories: { category: string; count: number }[];
}