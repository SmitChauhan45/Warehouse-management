import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Loading...
        </h2>
      </div>
    </div>
  );
};

export default LoadingScreen;