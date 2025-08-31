import React, { useState, useMemo, useEffect } from 'react';
import { User, Search, Filter, UserPlus, IndianRupee, Edit, Trash2, X, Save, UserCheck, UserX, Download } from 'lucide-react';
import { User as UserType } from '../types';
import { FilePersistence } from '../utils/filePersistence';

interface UsersTabProps {
  users: UserType[];
  onUpdateUser: (user: UserType) => void;
}

interface UserFormData {
  name: string;
  email: string;
  studentId?: string;
  employeeId?: string;
  department: string;
  year?: number;
  role: 'student' | 'admin';
  joinDate: string;
  phone: string;
  address: string;
  fines?: number;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, onUpdateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [localUsers, setLocalUsers] = useState<UserType[]>(users);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: '',
    email: '',
    studentId: '',
    employeeId: '',
    department: '',
    year: 1,
    role: 'student',
    joinDate: new Date().toISOString().split('T')[0],
    phone: '',
    address: '',
    fines: 0
  });

  // Update local users when props change
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  // Debug logging
  console.log('UsersTab render:', { users, searchTerm, roleFilter });

  // Validation
  if (!localUsers || !Array.isArray(localUsers)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p>Error: Users data is invalid</p>
          <p className="text-sm">Type: {typeof localUsers}</p>
          <p className="text-sm">Value: {JSON.stringify(localUsers)}</p>
        </div>
      </div>
    );
  }

  const filteredUsers = useMemo(() => {
    return localUsers
      .filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.studentId && user.studentId.includes(searchTerm))
      )
      .filter(user => roleFilter === '' || user.role === roleFilter);
  }, [localUsers, searchTerm, roleFilter]);

  const handleAddUser = () => {
    setShowAddForm(true);
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      studentId: '',
      employeeId: '',
      department: '',
      year: 1,
      role: 'student',
      joinDate: new Date().toISOString().split('T')[0],
      phone: '',
      address: '',
      fines: 0
    });
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setShowAddForm(true);
    setUserFormData({
      name: user.name,
      email: user.email,
      studentId: user.studentId || '',
      employeeId: user.employeeId || '',
      department: user.department,
      year: user.year || 1,
      role: user.role,
      joinDate: user.joinDate,
      phone: user.phone,
      address: user.address,
      fines: user.fines || 0
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = localUsers.find(u => u.id === userId);
    if (!user) return;

    if (window.confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      const updatedUsers = localUsers.filter(u => u.id !== userId);
      setLocalUsers(updatedUsers);
      alert('User deleted successfully!');
      
      // Update data for direct copy-paste
      FilePersistence.updateUsers(updatedUsers);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userFormData.name || !userFormData.email || !userFormData.department) {
      alert('Please fill in all required fields (name, email, department)');
      return;
    }

    if (userFormData.role === 'student' && !userFormData.studentId) {
      alert('Student ID is required for student users');
      return;
    }

    if (userFormData.role === 'admin' && !userFormData.employeeId) {
      alert('Employee ID is required for admin users');
      return;
    }

    if (editingUser) {
      // Update existing user
      const updatedUser: UserType = {
        ...editingUser,
        ...userFormData
      };
      
      const updatedUsers = localUsers.map(u => 
        u.id === editingUser.id ? updatedUser : u
      );
      
      setLocalUsers(updatedUsers);
      alert('User updated successfully!');
      
      // Update data for direct copy-paste
      FilePersistence.updateUsers(updatedUsers);
    } else {
      // Add new user
      const newUser: UserType = {
        id: Date.now().toString(),
        ...userFormData
      };
      
      const updatedUsers = [...localUsers, newUser];
      setLocalUsers(updatedUsers);
      alert('User added successfully!');
      
      // Update data for direct copy-paste
      FilePersistence.updateUsers(updatedUsers);
    }

    setShowAddForm(false);
    setEditingUser(null);
  };

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (role: 'student' | 'admin') => {
    setUserFormData(prev => ({
      ...prev,
      role,
      studentId: role === 'student' ? prev.studentId : '',
      employeeId: role === 'admin' ? prev.employeeId : ''
    }));
  };

  const toggleUserStatus = (userId: string) => {
    const user = localUsers.find(u => u.id === userId);
    if (!user) return;

    // In a real app, this would call an API
    console.log('Toggling user status:', userId);
    alert(`User ${user.name} status toggled! (This is a demo - no actual change occurred)`);
  };

  const handleExportUsers = () => {
    FilePersistence.updateUsers(localUsers);
    alert('Users data ready for copy-paste! Check the modal for the updated data.');
  };

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Debug Info</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>Total users: {localUsers.length}</p>
          <p>Filtered users: {filteredUsers.length}</p>
          <p>Search term: "{searchTerm}"</p>
          <p>Role filter: "{roleFilter}"</p>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Direct File Updates:</strong> Changes automatically show in a modal for easy copy-paste into your JSON files.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search users by name, email, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>

        <div className="flex space-x-2">
          <button 
            onClick={handleAddUser}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
                      <button 
              onClick={handleExportUsers}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Get current users data for copy-paste"
            >
              <Download className="h-4 w-4" />
              <span>Get Data</span>
            </button>
        </div>
      </div>

      {/* Add/Edit User Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {editingUser ? 'Edit User' : 'Add New User'}
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
                    Name *
                  </label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => handleRoleChange(e.target.value as 'student' | 'admin')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={userFormData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {userFormData.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      value={userFormData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}

                {userFormData.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={userFormData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}

                {userFormData.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={userFormData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="4"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={userFormData.joinDate}
                    onChange={(e) => handleInputChange('joinDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={userFormData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fines
                  </label>
                  <input
                    type="number"
                    value={userFormData.fines}
                    onChange={(e) => handleInputChange('fines', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={userFormData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <span>{editingUser ? 'Update User' : 'Add User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fines
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.studentId && (
                          <div className="text-xs text-gray-400">ID: {user.studentId}</div>
                        )}
                        {user.employeeId && (
                          <div className="text-xs text-gray-400">EMP: {user.employeeId}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.department}</div>
                    {user.year && (
                      <div className="text-sm text-gray-500">Year {user.year}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.fines && user.fines > 0 ? (
                      <div className="flex items-center space-x-1 text-red-600">
                        <IndianRupee className="h-4 w-4" />
                        <span className="font-medium">₹{user.fines}</span>
                      </div>
                    ) : (
                      <span className="text-green-600 font-medium">₹0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                        title="Toggle Status"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No users found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};