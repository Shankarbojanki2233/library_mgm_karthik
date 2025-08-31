// File persistence utility for managing JSON data
// Note: Browsers cannot directly write to files for security reasons
// This utility provides the updated data for direct copy-paste into your JSON files

export interface FilePersistenceOptions {
  filename: string;
  data: any;
  contentType?: string;
}

export class FilePersistence {
  /**
   * Store data in browser's local storage for easy access
   * @param key Storage key
   * @param data Data to store
   */
  static storeData(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`✅ Data stored in localStorage with key: ${key}`);
    } catch (error) {
      console.error('❌ Error storing data in localStorage:', error);
    }
  }

  /**
   * Get stored data from browser's local storage
   * @param key Storage key
   * @returns Stored data or null
   */
  static getStoredData(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Error retrieving data from localStorage:', error);
      return null;
    }
  }

  /**
   * Show updated data for direct copy-paste into JSON files
   * @param data The updated data
   * @param filename The filename to update
   */
  static showDataForUpdate(data: any, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    
    // Store in localStorage for easy access
    this.storeData(`updated_${filename}`, data);
    
    // Create a modal to show the data
    this.showDataModal(filename, jsonString);
    
    // Also log to console
    console.log(`📝 Updated ${filename} data ready for copy-paste:`);
    console.log(`📋 Copy this data and replace your ${filename} file:`);
    console.log(jsonString);
    
    // Show success message
    alert(`✅ ${filename} updated! Data is ready for copy-paste.\n\nCheck the modal or browser console (F12) for the updated data.`);
  }

  /**
   * Show a modal with the updated data for easy copy-paste
   * @param filename The filename
   * @param jsonString The JSON string data
   */
  private static showDataModal(filename: string, jsonString: string): void {
    // Remove existing modal if any
    const existingModal = document.getElementById('data-update-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'data-update-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-green-600">
            ✅ ${filename} Updated Successfully!
          </h2>
          <button onclick="this.closest('#data-update-modal').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>
        
        <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 class="font-medium text-green-800 mb-2">📋 Copy-Paste Instructions:</h3>
          <ol class="text-sm text-green-700 space-y-1 list-decimal list-inside">
            <li>Copy the JSON data below (click the "Copy All" button)</li>
            <li>Open your project file: <code class="bg-green-100 px-2 py-1 rounded">src/data/${filename}</code></li>
            <li>Replace ALL content with the copied data</li>
            <li>Save the file</li>
            <li>Refresh your browser to see the changes</li>
          </ol>
        </div>
        
        <div class="mb-4">
          <button onclick="navigator.clipboard.writeText(\`${jsonString.replace(/`/g, '\\`')}\`)" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            📋 Copy All Data
          </button>
          <button onclick="this.previousElementSibling.click()" class="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            ✅ I've Updated the File
          </button>
        </div>
        
        <div class="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700">Updated ${filename} Data:</span>
            <span class="text-xs text-gray-500">Click "Copy All Data" above to copy</span>
          </div>
          <pre class="text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap">${jsonString}</pre>
        </div>
        
        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 class="font-medium text-blue-800 mb-2">💡 Pro Tips:</h4>
          <ul class="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Always backup your original files before replacing</li>
            <li>Make sure to copy the ENTIRE JSON content</li>
            <li>After pasting, verify the JSON syntax is valid</li>
            <li>Restart the dev server if changes don't appear</li>
          </ul>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Update books data and show for copy-paste
   * @param books Updated books array
   */
  static updateBooks(books: any[]): void {
    this.showDataForUpdate(books, 'books.json');
  }

  /**
   * Update categories data and show for copy-paste
   * @param categories Updated categories array
   */
  static updateCategories(categories: any[]): void {
    this.showDataForUpdate(categories, 'categories.json');
  }

  /**
   * Update users data and show for copy-paste
   * @param users Updated users array
   */
  static updateUsers(users: any[]): void {
    this.showDataForUpdate(users, 'users.json');
  }

  /**
   * Create a comprehensive backup of all data
   * @param books Books data
   * @param categories Categories data
   * @param users Users data
   */
  static createBackup(books: any[], categories: any[], users: any[]): void {
    const backupData = {
      timestamp: new Date().toISOString(),
      books,
      categories,
      users
    };

    this.showDataForUpdate(backupData, 'library-backup.json');
    console.log('📦 Complete backup created! Check the modal for the data.');
  }

  /**
   * Get the latest updated data for a specific file
   * @param filename The filename
   * @returns The updated data or null
   */
  static getLatestData(filename: string): any {
    return this.getStoredData(`updated_${filename}`);
  }

  /**
   * Clear all stored data
   */
  static clearStoredData(): void {
    try {
      localStorage.clear();
      console.log('✅ All stored data cleared');
    } catch (error) {
      console.error('❌ Error clearing stored data:', error);
    }
  }

  /**
   * Show all available updated data
   */
  static showAllUpdates(): void {
    const books = this.getStoredData('updated_books.json');
    const categories = this.getStoredData('updated_categories.json');
    const users = this.getStoredData('updated_users.json');

    console.log('📊 All Available Updates:');
    if (books) console.log('📚 Books:', books);
    if (categories) console.log('🏷️ Categories:', categories);
    if (users) console.log('👥 Users:', users);

    if (!books && !categories && !users) {
      console.log('❌ No updates available. Make some changes first!');
    }
  }
}
