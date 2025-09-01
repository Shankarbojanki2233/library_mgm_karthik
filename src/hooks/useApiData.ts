import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Book, User, Category, Transaction } from '../types';

export const useApiData = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [booksData, usersData, categoriesData, transactionsData] = await Promise.all([
        apiService.getBooks(),
        apiService.getUsers(),
        apiService.getCategories(),
        apiService.getTransactions()
      ]);

      setBooks(booksData);
      setUsers(usersData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addBook = useCallback(async (bookData: Omit<Book, 'id'>) => {
    try {
      const newBook = await apiService.createBook(bookData);
      setBooks(prev => [...prev, newBook]);
      return newBook;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add book');
      throw err;
    }
  }, []);

  const updateBook = useCallback(async (id: string, bookData: Partial<Book>) => {
    try {
      const updatedBook = await apiService.updateBook(id, bookData);
      setBooks(prev => prev.map(book => book.id === id ? updatedBook : book));
      return updatedBook;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update book');
      throw err;
    }
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    try {
      await apiService.deleteBook(id);
      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
      throw err;
    }
  }, []);

  const addUser = useCallback(async (userData: Omit<User, 'id'>) => {
    try {
      const newUser = await apiService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      const updatedUser = await apiService.updateUser(id, userData);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await apiService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  }, []);

  const addCategory = useCallback(async (categoryData: Omit<Category, 'id'>) => {
    try {
      const newCategory = await apiService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, categoryData: Partial<Category>) => {
    try {
      const updatedCategory = await apiService.updateCategory(id, categoryData);
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await apiService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  }, []);

  const borrowBook = useCallback(async (bookId: string, userId: string) => {
    try {
      const result = await apiService.borrowBook(bookId, userId);
      // Refresh data to get updated availability
      await loadData();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to borrow book');
      throw err;
    }
  }, [loadData]);

  const returnBook = useCallback(async (transactionId: string) => {
    try {
      const result = await apiService.returnBook(transactionId);
      // Refresh data to get updated availability and transactions
      await loadData();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return book');
      throw err;
    }
  }, [loadData]);

  return {
    books,
    users,
    categories,
    transactions,
    loading,
    error,
    // CRUD operations
    addBook,
    updateBook,
    deleteBook,
    addUser,
    updateUser,
    deleteUser,
    addCategory,
    updateCategory,
    deleteCategory,
    // Library operations
    borrowBook,
    returnBook,
    // Utility
    refreshData: loadData,
  };
};