import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Store, 
  UtensilsCrossed, 
  ShoppingBag, 
  Users, 
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/locations', icon: MapPin, label: 'Locations' },
    { path: '/restaurants', icon: Store, label: 'Restaurants' },
    { path: '/menu-items', icon: UtensilsCrossed, label: 'Menu Items' },
    { path: '/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
  ];
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <aside className={`bg-gray-900 text-white h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!collapsed && <h1 className="text-xl font-bold">FoodOrder</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
