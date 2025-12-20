import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
      {/* Background food emojis */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <span className="absolute top-10 left-10 text-8xl">🍕</span>
        <span className="absolute top-20 right-20 text-7xl">🍔</span>
        <span className="absolute bottom-32 left-20 text-6xl">🌮</span>
        <span className="absolute bottom-10 right-32 text-8xl">🍜</span>
        <span className="absolute top-1/2 left-5 text-5xl">🍣</span>
        <span className="absolute top-1/3 right-10 text-6xl">🥗</span>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/30 mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            FoodOrder
          </h1>
          <p className="text-gray-500 mt-1">Delicious food, delivered fast</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-orange-200/50 p-8 border border-orange-100">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          © 2024 FoodOrder. Made with ❤️ for food lovers
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;