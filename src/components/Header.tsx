import React from 'react';
import { Library, User, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: any;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Library className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">sanketika Polytechnic College</h1>
              <p className="text-blue-100 text-sm">Library Management System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-blue-100 text-sm capitalize">{currentUser?.role}</p>
            </div>
            <User className="h-6 w-6" />
            <button
              onClick={onLogout}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};