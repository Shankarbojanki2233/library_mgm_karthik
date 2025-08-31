import React, { memo } from 'react';
import { Book, Calendar, MapPin, Star } from 'lucide-react';
import { Book as BookType } from '../types';

interface BookCardProps {
  book: BookType;
  onBorrow?: (bookId: string) => void;
  canBorrow?: boolean;
  userRole: string;
}

export const BookCard: React.FC<BookCardProps> = memo(({ book, onBorrow, canBorrow, userRole }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{book.title}</h3>
          <p className="text-gray-600 mb-2">by {book.author}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Calendar className="h-4 w-4" />
            <span>{book.year}</span>
            <MapPin className="h-4 w-4 ml-2" />
            <span>{book.location}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 mb-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{book.rating}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            book.available > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {book.available > 0 ? `${book.available} Available` : 'Out of Stock'}
          </span>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{book.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {book.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {userRole === 'student' && canBorrow && book.available > 0 && (
          <button
            onClick={() => onBorrow?.(book.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Borrow Book
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Category: {book.category}</span>
          <span>Publisher: {book.publisher}</span>
        </div>
      </div>
    </div>
  );
});