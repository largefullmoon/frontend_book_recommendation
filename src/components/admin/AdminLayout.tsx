import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Book, Users, BookOpen, BarChart3 } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  if (localStorage.getItem("adminAuth") != "true") {
    navigate('/admin/login')
  }
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const navItems = [
    {
      path: '/admin/books',
      label: 'Book List',
      icon: Book
    },
    {
      path: '/admin/recommendations',
      label: 'Recommendations',
      icon: BookOpen
    },
    // {
    //   path: '/admin/users',
    //   label: 'Users',
    //   icon: Users
    // },
    {
      path: '/admin/tracking',
      label: 'User Tracking',
      icon: BarChart3
    }
  ];

  return (
    <div className="flex min-h-[calc(100vh-200px)]">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-bold text-indigo-800">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${location.pathname === item.path
                ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700'
                : ''
                }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 mt-4 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-50">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 