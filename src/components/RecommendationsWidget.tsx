import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Book } from '../types';
import { BookCard } from './BookCard';

interface RecommendationsWidgetProps {
  recommendations: Book[];
  onBorrow: (bookId: string) => void;
  userRole: string;
}

export const RecommendationsWidget: React.FC<RecommendationsWidgetProps> = ({
  recommendations,
  onBorrow,
  userRole
}) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
        <TrendingUp className="h-4 w-4 text-purple-600" />
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        Based on your reading history and preferences, we think you'll love these books:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map(book => (
          <div key={book.id} className="transform scale-95">
            <BookCard
              book={book}
              onBorrow={onBorrow}
              canBorrow={true}
              userRole={userRole}
            />
          </div>
        ))}
      </div>
    </div>
  );
};