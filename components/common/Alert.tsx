import { ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

const Alert = ({ type, title, children, onClose }: AlertProps) => {
  const typeStyles = {
    success: {
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      containerClass: 'bg-green-50 border-green-400 dark:bg-green-900/30 dark:border-green-600',
      titleClass: 'text-green-800 dark:text-green-400',
      textClass: 'text-green-700 dark:text-green-300'
    },
    error: {
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      containerClass: 'bg-red-50 border-red-400 dark:bg-red-900/30 dark:border-red-600',
      titleClass: 'text-red-800 dark:text-red-400',
      textClass: 'text-red-700 dark:text-red-300'
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
      containerClass: 'bg-amber-50 border-amber-400 dark:bg-amber-900/30 dark:border-amber-600',
      titleClass: 'text-amber-800 dark:text-amber-400',
      textClass: 'text-amber-700 dark:text-amber-300'
    },
    info: {
      icon: <Info className="h-5 w-5 text-blue-400" />,
      containerClass: 'bg-blue-50 border-blue-400 dark:bg-blue-900/30 dark:border-blue-600',
      titleClass: 'text-blue-800 dark:text-blue-400',
      textClass: 'text-blue-700 dark:text-blue-300'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className={`rounded-md border-l-4 p-4 ${styles.containerClass}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.titleClass}`}>{title}</h3>
          )}
          <div className={`text-sm mt-2 ${styles.textClass}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${type === 'success' ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-500' :
                  type === 'error' ? 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-500' :
                  type === 'warning' ? 'bg-amber-50 text-amber-500 hover:bg-amber-100 focus:ring-amber-500' :
                  'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-500'}
                  dark:bg-transparent
                  dark:hover:bg-gray-700
                `}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;