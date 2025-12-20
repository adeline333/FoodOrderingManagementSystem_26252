import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  ChefHat,
  UtensilsCrossed,
  Users,
  MapPin,
  Pizza,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  // Admin & Restaurant Owner only
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', emoji: '📊', roles: ['ADMIN', 'RESTAURANT_OWNER'] },

  // Restaurant Owner only
  { path: '/my-restaurant', icon: Store, label: 'My Restaurant', emoji: '🏪', roles: ['RESTAURANT_OWNER'] },
  { path: '/my-menu', icon: UtensilsCrossed, label: 'My Menu', emoji: '🍽️', roles: ['RESTAURANT_OWNER'] },
  { path: '/order-management', icon: ChefHat, label: 'Manage Orders', emoji: '👨‍🍳', roles: ['ADMIN', 'RESTAURANT_OWNER'] },

  // Admin only
  { path: '/users', icon: Users, label: 'Users', emoji: '👥', roles: ['ADMIN'] },
  { path: '/locations', icon: MapPin, label: 'Locations', emoji: '📍', roles: ['ADMIN'] },
  { path: '/menu-items', icon: Pizza, label: 'Menu Items', emoji: '🍕', roles: ['ADMIN'] },

  // Customer pages (and everyone else)
  { path: '/restaurants', icon: Store, label: 'Restaurants', emoji: '🏪', roles: ['CUSTOMER', 'ADMIN'] },
  { path: '/cart', icon: ShoppingCart, label: 'Cart', emoji: '🛒', showBadge: true, roles: ['CUSTOMER'] },
  { path: '/orders', icon: ShoppingBag, label: 'My Orders', emoji: '📦' },
  { path: '/payments', icon: CreditCard, label: 'Payments', emoji: '💳', roles: ['ADMIN'] },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { getCartCount } = useCart();
  const { user } = useAuth();
  const cartCount = getCartCount();

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-orange-100 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-orange-100 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-bold text-white">FoodOrder</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.showBadge && cartCount > 0 && (
                  <span className="min-w-[24px] h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-md">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-4 text-center border border-orange-200">
            <div className="text-3xl mb-2">🍕</div>
            <p className="text-sm font-bold text-gray-800">Hungry?</p>
            <p className="text-xs text-gray-600 mt-1">Browse restaurants & order!</p>
            <NavLink
              to="/restaurants"
              className="mt-3 block w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Order Now
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;