import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Warehouse, 
  Package, 
  User, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Warehouses', href: '/warehouses', icon: Warehouse },
    { name: 'Inventory', href: '/items', icon: Package },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings, adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex flex-col flex-grow overflow-y-auto">
        <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-blue-600">
          <h1 className="text-xl font-bold text-white">WMS</h1>
        </div>
        <div className="flex flex-col flex-grow px-4 pb-4">
          <div className="mt-5 flex flex-col flex-1">
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}
                      transition-colors duration-150 ease-in-out
                    `}
                  >
                    <item.icon 
                      className={`
                        mr-3 h-5 w-5 
                        ${isActive 
                          ? 'text-blue-500 dark:text-blue-400' 
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'}
                      `} 
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="pt-4 mt-5 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 space-y-1">
              <button
                onClick={logout}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                <LogOut className="mr-3 h-5 w-5 text-red-500 dark:text-red-400" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;