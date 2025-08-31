import { useState, useEffect } from 'react';
import { Book, User, Category, Transaction } from '../types';
import booksData from '../data/books.json';
import usersData from '../data/users.json';
import categoriesData from '../data/categories.json';
import transactionsData from '../data/transactions.json';

export const useLibraryData = () => {
  const [books, setBooks] = useState<Book[]>(booksData as Book[]);
  const [users, setUsers] = useState<User[]>(usersData as User[]);
  const [categories, setCategories] = useState<Category[]>(categoriesData as Category[]);
  const [transactions, setTransactions] = useState<Transaction[]>(transactionsData as Transaction[]);
  const [loading, setLoading] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('useLibraryData data loaded:', {
      books: books.length,
      users: users.length,
      categories: categories.length,
      transactions: transactions.length
    });
  }, [books, users, categories, transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update book availability
    if (transaction.type === 'borrow') {
      setBooks(prev => prev.map(book => 
        book.id === transaction.bookId 
          ? { ...book, available: book.available - 1 }
          : book
      ));
    } else if (transaction.type === 'return') {
      setBooks(prev => prev.map(book => 
        book.id === transaction.bookId 
          ? { ...book, available: book.available + 1 }
          : book
      ));
    }
  };

  const updateUserFines = (userId: string, fineAmount: number) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, fines: (user.fines || 0) + fineAmount }
        : user
    ));
  };

  return {
    books,
    users,
    categories,
    transactions,
    loading,
    addTransaction,
    updateUserFines,
    setBooks,
    setUsers
  };
};