import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Book as BookIcon, Edit, Trash2, X, Save, Download } from 'lucide-react';
import { BookCard } from './BookCard';
import { Book, Category } from '../types';
import { FilePersistence } from '../utils/filePersistence';

interface BooksTabProps {
  books: Book[];
  categories: Category[];
  onBorrowBook: (bookId: string) => void;
  userRole: string;
}

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  subCategory: string;
  publisher: string;
  year: number;
  copies: number;
  location: string;
  description: string;
  tags: string[];
  rating: number;
  popularity: number;
}

export const BooksTab: React.FC<BooksTabProps> = ({ books, categories, onBorrowBook, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [localBooks, setLocalBooks] = useState<Book[]>(books);
  const [bookFormData, setBookFormData] = useState<BookFormData>({
    title: '',
    author: '',
    isbn: '',
    category: '',
    subCategory: '',
    publisher: '',
    year: new Date().getFullYear(),
    copies: 1,
    location: '',
    description: '',
    tags: [],
    rating: 0,
    popularity: 0
  });

  // Update local books when props change
  React.useEffect(() => {
    setLocalBooks(books);
  }, [books]);

  const filteredBooks = useMemo(() => {
    return localBooks
      .filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(book => selectedCategory === '' || book.category === selectedCategory)
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'author':
            return a.author.localeCompare(b.author);
          case 'year':
            return b.year - a.year;
          case 'rating':
            return b.rating - a.rating;
          case 'popularity':
            return b.popularity - a.popularity;
          default:
            return 0;
        }
      });
  }, [localBooks, searchTerm, selectedCategory, sortBy]);

  const handleAddBook = () => {
    setShowAddForm(true);
    setEditingBook(null);
    setBookFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      subCategory: '',
      publisher: '',
      year: new Date().getFullYear(),
      copies: 1,
      location: '',
      description: '',
      tags: [],
      rating: 0,
      popularity: 0
    });
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowAddForm(true);
    setBookFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      subCategory: book.subCategory,
      publisher: book.publisher,
      year: book.year,
      copies: book.copies,
      location: book.location,
      description: book.description,
      tags: [...book.tags],
      rating: book.rating,
      popularity: book.popularity
    });
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      const updatedBooks = localBooks.filter(book => book.id !== bookId);
      setLocalBooks(updatedBooks);
      alert('Book deleted successfully!');
      
      // Update data for direct copy-paste
      FilePersistence.updateBooks(updatedBooks);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookFormData.title || !bookFormData.author || !bookFormData.category) {
      alert('Please fill in all required fields (title, author, category)');
      return;
    }

    if (editingBook) {
      // Update existing book
      const updatedBook: Book = {
        ...editingBook,
        ...bookFormData,
        available: bookFormData.copies // Reset available to match copies when editing
      };
      
      const updatedBooks = localBooks.map(book => 
        book.id === editingBook.id ? updatedBook : book
      );
      
      setLocalBooks(updatedBooks);
      alert('Book updated successfully!');
      
      // Update data for direct copy-paste
      FilePersistence.updateBooks(updatedBooks);
    } else {
      // Add new book
      const newBook: Book = {
        id: Date.now().toString(),
        ...bookFormData,
        available: bookFormData.copies
      };
      
      const updatedBooks = [...localBooks, newBook];
      setLocalBooks(updatedBooks);
      alert('Book added successfully!');
      
      // Update data for direct copy-paste
      FilePersistence.updateBooks(updatedBooks);
    }

    setShowAddForm(false);
    setEditingBook(null);
  };

  const handleInputChange = (field: keyof BookFormData, value: any) => {
    setBookFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setBookFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const getSubCategories = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.subCategories || [];
  };

  const handleExportBooks = () => {
    FilePersistence.updateBooks(localBooks);
    alert('Books data ready for copy-paste! Check the modal for the updated data.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search books by title, author, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="title">Sort by Title</option>
          <option value="author">Sort by Author</option>
          <option value="year">Sort by Year</option>
          <option value="rating">Sort by Rating</option>
          <option value="popularity">Sort by Popularity</option>
        </select>

        {userRole === 'admin' && (
          <div className="flex space-x-2">
            <button 
              onClick={handleAddBook}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Book</span>
            </button>
            <button 
              onClick={handleExportBooks}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Get current books data for copy-paste"
            >
              <Download className="h-4 w-4" />
              <span>Get Data</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredBooks.length} of {localBooks.length} books
        </p>
        {userRole === 'admin' && (
          <div className="text-sm text-gray-500">
            💡 Changes automatically show in a modal for easy copy-paste into your JSON files.
          </div>
        )}
      </div>

      {/* Add/Edit Book Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={bookFormData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={bookFormData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={bookFormData.isbn}
                    onChange={(e) => handleInputChange('isbn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={bookFormData.category}
                    onChange={(e) => {
                      handleInputChange('category', e.target.value);
                      handleInputChange('subCategory', '');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-Category
                  </label>
                  <select
                    value={bookFormData.subCategory}
                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Sub-Category</option>
                    {getSubCategories(bookFormData.category).map(subCat => (
                      <option key={subCat} value={subCat}>
                        {subCat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={bookFormData.publisher}
                    onChange={(e) => handleInputChange('publisher', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={bookFormData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Copies
                  </label>
                  <input
                    type="number"
                    value={bookFormData.copies}
                    onChange={(e) => handleInputChange('copies', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={bookFormData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CS-A-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={bookFormData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={bookFormData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., programming, algorithms, data structures"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    value={bookFormData.rating}
                    onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Popularity (0-100)
                  </label>
                  <input
                    type="number"
                    value={bookFormData.popularity}
                    onChange={(e) => handleInputChange('popularity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingBook ? 'Update Book' : 'Add Book'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <div key={book.id} className="relative group">
            <BookCard
              book={book}
              onBorrow={onBorrowBook}
              canBorrow={true}
              userRole={userRole}
            />
            
            {userRole === 'admin' && (
              <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleEditBook(book)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  title="Edit Book"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteBook(book.id)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                  title="Delete Book"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};