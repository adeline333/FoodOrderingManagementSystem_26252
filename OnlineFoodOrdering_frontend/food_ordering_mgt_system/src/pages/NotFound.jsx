import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="text-9xl font-black text-orange-200">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-bounce">🍕</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Oops! Page not found
        </h1>

        <p className="text-gray-500 mb-8">
          The page you're looking for seems to have wandered off.
          Maybe it went to grab some food?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/restaurants"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-orange-200 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-orange-200">
          <p className="text-gray-400 text-sm">
            Looking for something specific? Try browsing our restaurants.
          </p>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 mt-3 text-orange-600 hover:text-orange-700 font-medium"
          >
            <Search className="w-4 h-4" />
            Browse Restaurants
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
