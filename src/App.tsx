import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BooksTab } from './components/BooksTab';
import { BorrowedBooksTab } from './components/BorrowedBooksTab';
import { UsersTab } from './components/UsersTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { CategoriesTab } from './components/CategoriesTab';
import { LoginForm } from './components/LoginForm';
import { useApiData } from './hooks/useApiData';
import { FineCalculator } from './utils/fineCalculator';
import { User, Book, Category, Transaction } from './types';
import { FilePersistence } from './utils/filePersistence';

// Memoize components to prevent unnecessary re-renders
const MemoizedHeader = memo(Header);
const MemoizedSidebar = memo(Sidebar);
const MemoizedBooksTab = memo(BooksTab);
const MemoizedBorrowedBooksTab = memo(BorrowedBooksTab);
const MemoizedUsersTab = memo(UsersTab);
const MemoizedAnalyticsTab = memo(AnalyticsTab);
const MemoizedCategoriesTab = memo(CategoriesTab);
const MemoizedLoginForm = memo(LoginForm);

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('welcome');
  const [renderCount, setRenderCount] = useState(0);
  const { 
    books, 
    users, 
    categories, 
    transactions, 
    loading, 
    error,
    borrowBook,
    returnBook,
    addBook,
    updateBook,
    deleteBook,
    addUser,
    updateUser,
    deleteUser,
    addCategory,
    updateCategory,
    deleteCategory
  } = useApiData();

  // Performance monitoring
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log(`App rendered ${renderCount + 1} times`);
  });

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('welcome');
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleBorrowBook = useCallback((bookId: string) => {
    if (!currentUser) return;

    borrowBook(bookId, currentUser.id)
      .then((result) => {
        alert(`Book borrowed successfully! Due date: ${result.due_date}`);
      })
      .catch((err) => {
        alert(`Failed to borrow book: ${err.message}`);
      });
  }, [currentUser, borrowBook]);

  const handleReturnBook = useCallback((transactionId: string) => {
    returnBook(transactionId)
      .then((result) => {
        if (result.fine_amount > 0) {
          alert(`Book returned with fine: ₹${result.fine_amount}. Please pay at the library counter.`);
        } else {
          alert('Book returned successfully!');
        }
      })
      .catch((err) => {
        alert(`Failed to return book: ${err.message}`);
      });
  }, [returnBook]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading library data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">Failed to connect to the Django backend server.</p>
          <p className="text-sm text-gray-500 mb-4">Error: {error}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md">
            <h3 className="font-medium text-blue-800 mb-2">To start the Django server:</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Open a new terminal</li>
              <li>Run: <code className="bg-blue-100 px-1 rounded">python backend/run_server.py</code></li>
              <li>Wait for the server to start</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <MemoizedLoginForm users={users} onLogin={handleLogin} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'welcome':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Welcome to the Library Management System</h2>
            <p className="text-gray-600 mb-6">Hello {currentUser.name}! You can now access all the library features.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">📚 Browse Books</h3>
                <p className="text-sm text-blue-600">Explore our collection of books across different categories</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-800 mb-2">📖 My Books</h3>
                <p className="text-sm text-green-600">View your borrowed books and manage returns</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-800 mb-2">🏷️ Categories</h3>
                <p className="text-sm text-purple-600">Browse books by category and genre</p>
              </div>
              
              {currentUser.role === 'admin' && (
                <>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h3 className="font-medium text-orange-800 mb-2">👥 Users</h3>
                    <p className="text-sm text-orange-600">Manage library users and their accounts</p>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="font-medium text-red-800 mb-2">📊 Analytics</h3>
                    <p className="text-sm text-red-600">View library statistics and reports</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2">⚙️ Settings</h3>
                    <p className="text-sm text-gray-600">Configure system settings and preferences</p>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case 'books':
        return (
          <MemoizedBooksTab
              books={books}
              categories={categories}
              onBorrowBook={handleBorrowBook}
              onAddBook={addBook}
              onUpdateBook={updateBook}
              onDeleteBook={deleteBook}
              userRole={currentUser.role}
            />
        );
      case 'categories':
        return (
          <MemoizedCategoriesTab 
            categories={categories} 
            books={books}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        );
      case 'borrowed':
        return (
          <MemoizedBorrowedBooksTab
            transactions={transactions}
            books={books}
            currentUser={currentUser}
            onReturnBook={handleReturnBook}
          />
        );
      case 'users':
        return currentUser.role === 'admin' ? (
          <MemoizedUsersTab 
            users={users} 
            onAddUser={addUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
          </div>
        );
      case 'analytics':
        return currentUser.role === 'admin' ? (
          <MemoizedAnalyticsTab books={books} users={users} transactions={transactions} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
          </div>
        );
      case 'settings':
        return currentUser.role === 'admin' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold">Settings</h2>
            <p className="text-gray-600 mt-2">Library management settings and data management.</p>
            
            <div className="mt-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">⚙️ System Settings</h3>
                <p className="text-sm text-gray-600">Configure library system settings</p>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Auto-save changes</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" name="toggle" id="auto-save" className="toggle-checkbox absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer" defaultChecked />
                      <label htmlFor="auto-save" className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Email notifications</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" name="toggle" id="notifications" className="toggle-checkbox absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer" />
                      <label htmlFor="notifications" className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Dark mode</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" name="toggle" id="dark-mode" className="toggle-checkbox absolute block w-6 h-6 bg-white border-4 rounded-full cursor-pointer" />
                      <label htmlFor="dark-mode" className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">💾 Data Management</h3>
                <p className="text-sm text-gray-600">Manage your library data and get updated content for copy-paste</p>
                
                <div className="mt-4 space-y-3">
                  <button 
                    onClick={() => {
                      if (window.confirm('Create a complete backup of all library data?')) {
                        FilePersistence.createBackup(books, categories, users);
                        alert('Backup created successfully! Check the modal for the data.');
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Create Complete Backup</span>
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button 
                      onClick={() => {
                        FilePersistence.updateBooks(books);
                        alert('Books data ready for copy-paste! Check the modal for the data.');
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Get Books Data</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        FilePersistence.updateCategories(categories);
                        alert('Categories data ready for copy-paste! Check the modal for the data.');
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Get Categories Data</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        FilePersistence.updateUsers(users);
                        alert('Users data ready for copy-paste! Check the modal for the data.');
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Get Users Data</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">📋 Copy-Paste Guide</h3>
                <p className="text-sm text-gray-600">How to update your JSON files with the copied data</p>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">🔄 Direct File Update Process:</h4>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>Make changes in the admin panel (add/edit/delete)</li>
                    <li>Click the "Copy All Data" button in the modal that appears</li>
                    <li>Open your project file: <code className="bg-yellow-100 px-1 rounded">src/data/filename.json</code></li>
                    <li>Replace ALL content with the copied data</li>
                    <li>Save the file and refresh your browser</li>
                  </ol>
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Pro Tips:</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Always backup your original files before replacing</li>
                    <li>Make sure to copy the ENTIRE JSON content</li>
                    <li>After pasting, verify the JSON syntax is valid</li>
                    <li>Use the Settings tab to get current data anytime</li>
                  </ul>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">📊 System Information</h3>
                <p className="text-sm text-gray-600">Current library system status</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Books: <span className="font-medium text-gray-900">{books.length}</span></p>
                    <p className="text-gray-600">Total Categories: <span className="font-medium text-gray-900">{categories.length}</span></p>
                    <p className="text-gray-600">Total Users: <span className="font-medium text-gray-900">{users.length}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-600">Available Books: <span className="font-medium text-gray-900">{books.reduce((sum, book) => sum + book.available, 0)}</span></p>
                    <p className="text-gray-600">Borrowed Books: <span className="font-medium text-gray-900">{books.reduce((sum, book) => sum + (book.copies - book.available), 0)}</span></p>
                    <p className="text-gray-600">Admin Users: <span className="font-medium text-gray-900">{users.filter(u => u.role === 'admin').length}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold">Welcome to the Library</h2>
            <p className="text-gray-600 mt-2">Select a tab from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <MemoizedHeader currentUser={currentUser} onLogout={handleLogout} />
      
      <div className="flex">
        <MemoizedSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userRole={currentUser.role}
        />
        
        <main className="flex-1 p-6">
          {renderTabContent()}
        </main>
      </div>
      
      {/* Performance debug info */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
        Renders: {renderCount}
      </div>
    </div>
  );
}

export default App;