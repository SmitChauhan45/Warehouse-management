import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Warehouse, 
  Package, 
  User, 
  Settings,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Fragment } from 'react';

interface MobileSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MobileSidebar = ({ open, setOpen }: MobileSidebarProps) => {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex z-40 md:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        onClick={() => setOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            onClick={() => setOpen(false)}
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center justify-center h-16 bg-blue-600">
            <h1 className="text-xl font-bold text-white">WMS</h1>
          </div>
          <nav className="mt-5 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-base font-medium rounded-md
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}
                  `}
                  onClick={() => setOpen(false)}
                >
                  <item.icon 
                    className={`
                      mr-4 h-6 w-6 
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
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="flex items-center px-4 py-2 text-base font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
          >
            <LogOut className="mr-4 h-6 w-6 text-red-500 dark:text-red-400" />
            Logout
          </button>
        </div>
      </div>
      
      <div className="flex-shrink-0 w-14" aria-hidden="true">
        {/* Force sidebar to shrink to fit close icon */}
      </div>
    </div>
  );
};

export default MobileSidebar;