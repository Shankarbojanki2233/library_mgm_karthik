import { Book, User, Transaction } from '../types';

export class LibraryMLEngine {
  private books: Book[];
  private users: User[];
  private transactions: Transaction[];

  constructor(books: Book[], users: User[], transactions: Transaction[]) {
    this.books = books;
    this.users = users;
    this.transactions = transactions;
  }

  // Collaborative filtering for book recommendations
  getRecommendationsForUser(userId: string, limit: number = 5): Book[] {
    const userTransactions = this.transactions.filter(t => t.userId === userId);
    const userCategories = new Map<string, number>();
    const userTags = new Map<string, number>();

    // Analyze user preferences
    userTransactions.forEach(transaction => {
      const book = this.books.find(b => b.id === transaction.bookId);
      if (book) {
        userCategories.set(book.category, (userCategories.get(book.category) || 0) + 1);
        book.tags.forEach(tag => {
          userTags.set(tag, (userTags.get(tag) || 0) + 1);
        });
      }
    });

    // Score books based on user preferences
    const recommendations = this.books
      .filter(book => book.available > 0)
      .filter(book => !userTransactions.some(t => t.bookId === book.id && t.status === 'borrowed'))
      .map(book => {
        let score = 0;
        
        // Category preference score
        const categoryScore = userCategories.get(book.category) || 0;
        score += categoryScore * 3;

        // Tag preference score
        book.tags.forEach(tag => {
          const tagScore = userTags.get(tag) || 0;
          score += tagScore * 2;
        });

        // Popularity boost
        score += book.popularity * 0.1;
        
        // Rating boost
        score += book.rating * 2;

        return { ...book, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  // Predict if a book will be popular
  predictBookPopularity(book: Book): number {
    let score = 0;
    
    // Recent publication boost
    const currentYear = new Date().getFullYear();
    const yearScore = Math.max(0, 10 - (currentYear - book.year));
    score += yearScore * 5;

    // Rating influence
    score += book.rating * 10;

    // Category popularity
    const categoryBooks = this.books.filter(b => b.category === book.category);
    const avgCategoryPopularity = categoryBooks.reduce((sum, b) => sum + b.popularity, 0) / categoryBooks.length;
    score += avgCategoryPopularity * 0.3;

    return Math.min(100, Math.max(0, score));
  }

  // Analyze borrowing patterns
  getBorrowingPatterns(): any {
    const patterns = {
      dailyBorrows: new Map<string, number>(),
      categoryTrends: new Map<string, number>(),
      userActivity: new Map<string, number>(),
      overduePatterns: new Map<string, number>()
    };

    this.transactions.forEach(transaction => {
      const date = new Date(transaction.borrowDate).toDateString();
      patterns.dailyBorrows.set(date, (patterns.dailyBorrows.get(date) || 0) + 1);

      const book = this.books.find(b => b.id === transaction.bookId);
      if (book) {
        patterns.categoryTrends.set(book.category, (patterns.categoryTrends.get(book.category) || 0) + 1);
      }

      patterns.userActivity.set(transaction.userId, (patterns.userActivity.get(transaction.userId) || 0) + 1);

      if (transaction.status === 'overdue') {
        const userId = transaction.userId;
        patterns.overduePatterns.set(userId, (patterns.overduePatterns.get(userId) || 0) + 1);
      }
    });

    return {
      dailyBorrows: Array.from(patterns.dailyBorrows.entries()),
      categoryTrends: Array.from(patterns.categoryTrends.entries()),
      userActivity: Array.from(patterns.userActivity.entries()),
      overduePatterns: Array.from(patterns.overduePatterns.entries())
    };
  }

  // Calculate fine for overdue books
  calculateFine(borrowDate: string, dueDate: string, returnDate?: string): number {
    const due = new Date(dueDate);
    const returned = returnDate ? new Date(returnDate) : new Date();
    
    if (returned <= due) return 0;
    
    const overdueDays = Math.ceil((returned.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return overdueDays * 1; // ₹1 per day
  }

  // Suggest optimal book inventory
  getInventorySuggestions(): any[] {
    const suggestions = [];
    
    this.books.forEach(book => {
      const borrowCount = this.transactions.filter(t => t.bookId === book.id).length;
      const demandRatio = borrowCount / book.copies;
      
      if (demandRatio > 0.8 && book.available === 0) {
        suggestions.push({
          type: 'increase_stock',
          book: book.title,
          reason: 'High demand, frequently unavailable',
          priority: 'high'
        });
      } else if (demandRatio < 0.2 && book.copies > 2) {
        suggestions.push({
          type: 'reduce_stock',
          book: book.title,
          reason: 'Low demand, excess inventory',
          priority: 'low'
        });
      }
    });

    return suggestions;
  }
}