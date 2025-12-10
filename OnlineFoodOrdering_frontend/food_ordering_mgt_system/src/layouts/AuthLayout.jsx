import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">FoodOrder</h1>
          <p className="text-blue-100">Your favorite food, delivered fast</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Outlet />
        </div>
        
        <p className="text-center text-white text-sm mt-8">
          © {new Date().getFullYear()} FoodOrder. All rights reserved.
        </p>
      </div>
    </div>
  );
};