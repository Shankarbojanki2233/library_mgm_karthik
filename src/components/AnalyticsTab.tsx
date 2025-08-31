import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, AlertTriangle, IndianRupee, Clock } from 'lucide-react';
import { Book, User, Transaction } from '../types';

interface AnalyticsTabProps {
  books: Book[];
  users: User[];
  transactions: Transaction[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ books, users, transactions }) => {
  const stats = useMemo(() => ({
    totalBooks: books.length,
    borrowedBooks: transactions.filter(t => t.status === 'borrowed').length,
    overdueBooks: transactions.filter(t => t.status === 'overdue').length,
    totalUsers: users.filter(u => u.role === 'student').length,
    totalFines: users.reduce((sum, user) => sum + (user.fines || 0), 0)
  }), [books, transactions, users]);

  const popularCategories = useMemo(() => {
    return books.reduce((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + (book.copies - book.available);
      return acc;
    }, {} as Record<string, number>);
  }, [books]);

  const categoryStats = useMemo(() => {
    const categoryMap = new Map<string, { total: number; borrowed: number; available: number }>();
    
    books.forEach(book => {
      const existing = categoryMap.get(book.category) || { total: 0, borrowed: 0, available: 0 };
      existing.total += book.copies;
      existing.borrowed += (book.copies - book.available);
      existing.available += book.available;
      categoryMap.set(book.category, existing);
    });
    
    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      ...stats
    }));
  }, [books]);

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
      .slice(0, 10);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Borrowed</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.borrowedBooks}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueBooks}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fines</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.totalFines}</p>
            </div>
            <IndianRupee className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Popular Categories Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
        <div className="space-y-3">
          {Object.entries(popularCategories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-gray-700">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(popularCategories))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Category Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Category Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Books
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrowed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryStats.map(({ category, total, borrowed, available }) => (
                <tr key={category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {borrowed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {available}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {total > 0 ? Math.round((borrowed / total) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.map(transaction => {
            const book = books.find(b => b.id === transaction.bookId);
            const user = users.find(u => u.id === transaction.userId);
            
            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{book?.title || 'Unknown Book'}</p>
                    <p className="text-sm text-gray-500">by {user?.name || 'Unknown User'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{transaction.type}</p>
                  <p className="text-xs text-gray-500">{new Date(transaction.borrowDate).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};