import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, X, Save, Download } from 'lucide-react';
import { Category, Book } from '../types';
import { FilePersistence } from '../utils/filePersistence';

interface CategoriesTabProps {
  categories: Category[];
  books: Book[];
}

interface CategoryFormData {
  name: string;
  subCategories: string[];
  code: string;
  description: string;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({ categories, books }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    subCategories: [],
    code: '',
    description: ''
  });

  // Update local categories when props change
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  // Debug logging
  console.log('CategoriesTab render:', { categories, books, searchTerm });

  // Simple validation
  if (!localCategories || !Array.isArray(localCategories)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p>Error: Categories data is invalid</p>
          <p className="text-sm">Type: {typeof localCategories}</p>
          <p className="text-sm">Value: {JSON.stringify(localCategories)}</p>
        </div>
      </div>
    );
  }

  if (!books || !Array.isArray(books)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p>Error: Books data is invalid</p>
          <p className="text-sm">Type: {typeof books}</p>
          <p className="text-sm">Value: {JSON.stringify(books)}</p>
        </div>
      </div>
    );
  }

  const filteredCategories = localCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryStats = (categoryName: string) => {
    const categoryBooks = books.filter(book => book.category === categoryName);
    return {
      totalBooks: categoryBooks.length,
      borrowedBooks: categoryBooks.reduce((sum, book) => sum + (book.copies - book.available), 0),
      availableBooks: categoryBooks.reduce((sum, book) => sum + book.available, 0)
    };
  };

  const handleAddCategory = () => {
    setShowAddForm(true);
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      subCategories: [],
      code: '',
      description: ''
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowAddForm(true);
    setCategoryFormData({
      name: category.name,
      subCategories: [...category.subCategories],
      code: category.code,
      description: category.description
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = localCategories.find(cat => cat.id === categoryId);
    if (!category) return;

    // Check if category has books
    const booksInCategory = books.filter(book => book.category === category.name);
    if (booksInCategory.length > 0) {
      alert(`Cannot delete category "${category.name}" because it contains ${booksInCategory.length} books. Please move or delete the books first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
      const updatedCategories = localCategories.filter(cat => cat.id !== categoryId);
      setLocalCategories(updatedCategories);
      alert('Category deleted successfully!');
      
      // Update data for direct copy-paste
      FilePersistence.updateCategories(updatedCategories);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryFormData.name || !categoryFormData.code) {
      alert('Please fill in all required fields (name and code)');
      return;
    }

    if (editingCategory) {
      // Update existing category
      const updatedCategory: Category = {
        ...editingCategory,
        ...categoryFormData
      };
      
      const updatedCategories = localCategories.map(cat => 
        cat.id === editingCategory.id ? updatedCategory : cat
      );
      
      setLocalCategories(updatedCategories);
      alert('Category updated successfully!');
      
      // Update data for direct copy-paste
      FilePersistence.updateCategories(updatedCategories);
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        ...categoryFormData
      };
      
      const updatedCategories = [...localCategories, newCategory];
      setLocalCategories(updatedCategories);
      alert('Category added successfully!');
      
      // Update data for direct copy-paste
      FilePersistence.updateCategories(updatedCategories);
    }

    setShowAddForm(false);
    setEditingCategory(null);
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setCategoryFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubCategoriesChange = (subCategoriesString: string) => {
    const subCategories = subCategoriesString.split(',').map(subCat => subCat.trim()).filter(subCat => subCat.length > 0);
    setCategoryFormData(prev => ({
      ...prev,
      subCategories
    }));
  };

  const handleExportCategories = () => {
    FilePersistence.updateCategories(localCategories);
    alert('Categories data ready for copy-paste! Check the modal for the updated data.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleAddCategory}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
                      <button 
              onClick={handleExportCategories}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Get current categories data for copy-paste"
            >
              <Download className="h-4 w-4" />
              <span>Get Data</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Debug Info</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>Categories count: {localCategories.length}</p>
          <p>Books count: {books.length}</p>
          <p>Search term: "{searchTerm}"</p>
          <p>Filtered categories: {filteredCategories.length}</p>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Direct File Updates:</strong> Changes automatically show in a modal for easy copy-paste into your JSON files.
          </p>
        </div>
      </div>

      {/* Add/Edit Category Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={categoryFormData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CS, MATH, ECE"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Categories (comma-separated)
                </label>
                <input
                  type="text"
                  value={categoryFormData.subCategories.join(', ')}
                  onChange={(e) => handleSubCategoriesChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Programming, Database, Security"
                />
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
                  <span>{editingCategory ? 'Update Category' : 'Add Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map(category => {
          const stats = getCategoryStats(category.name);
          return (
            <div key={category.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group">
              {/* Admin Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  title="Edit Category"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                  title="Delete Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Tag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">Code: {category.code}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{category.description}</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalBooks}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.borrowedBooks}</p>
                  <p className="text-xs text-gray-500">Borrowed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.availableBooks}</p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Sub-categories</p>
                <div className="flex flex-wrap gap-1">
                  {category.subCategories && category.subCategories.map((subCat, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {subCat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No categories found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};