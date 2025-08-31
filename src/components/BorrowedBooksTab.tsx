import React from 'react';
import { Clock, AlertTriangle, Calendar, IndianRupee } from 'lucide-react';
import { Book, Transaction, User } from '../types';
import { FineCalculator } from '../utils/fineCalculator';

interface BorrowedBooksTabProps {
  transactions: Transaction[];
  books: Book[];
  currentUser: User;
  onReturnBook: (transactionId: string) => void;
}

export const BorrowedBooksTab: React.FC<BorrowedBooksTabProps> = ({
  transactions,
  books,
  currentUser,
  onReturnBook
}) => {
  const userTransactions = transactions.filter(
    t => t.userId === currentUser.id && (t.status === 'borrowed' || t.status === 'overdue')
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Borrowed Books</h2>
        
        {userTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">You haven't borrowed any books yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userTransactions.map(transaction => {
              const book = books.find(b => b.id === transaction.bookId);
              if (!book) return null;

              const isOverdue = FineCalculator.isOverdue(transaction.dueDate);
              const daysOverdue = FineCalculator.getDaysOverdue(transaction.dueDate);
              const currentFine = FineCalculator.calculateFine(transaction.dueDate);

              return (
                <div
                  key={transaction.id}
                  className={`border rounded-lg p-4 ${
                    isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{book.title}</h3>
                      <p className="text-gray-600 mb-2">by {book.author}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Borrowed: {new Date(transaction.borrowDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Due: {new Date(transaction.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {isOverdue && (
                        <div className="flex items-center space-x-2 mt-2 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {daysOverdue} day(s) overdue
                          </span>
                          <div className="flex items-center space-x-1">
                            <IndianRupee className="h-4 w-4" />
                            <span>Fine: ₹{currentFine}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onReturnBook(transaction.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Return Book
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {currentUser.fines && currentUser.fines > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Outstanding Fines</span>
          </div>
          <div className="flex items-center space-x-1 mt-2 text-red-700">
            <IndianRupee className="h-5 w-5" />
            <span className="text-xl font-bold">₹{currentUser.fines}</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Please pay your fines at the library counter.
          </p>
        </div>
      )}
    </div>
  );
};