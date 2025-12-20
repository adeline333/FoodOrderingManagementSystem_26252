import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentRestaurant, setCurrentRestaurant] = useState(() => {
    const saved = localStorage.getItem('cartRestaurant');
    return saved ? JSON.parse(saved) : null;
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('cartRestaurant', JSON.stringify(currentRestaurant));
  }, [currentRestaurant]);

  const addToCart = (item) => {
    // Check if item is from a different restaurant
    if (currentRestaurant && item.restaurantId && currentRestaurant.id !== item.restaurantId) {
      // Show confirmation toast with action buttons
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-medium">Your cart contains items from {currentRestaurant.name}.</p>
          <p className="text-sm text-gray-600">Would you like to clear your cart and add items from this restaurant instead?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                clearCartAndAddItem(item);
                toast.dismiss(t.id);
              }}
              className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
            >
              Clear & Add
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ), {
        duration: 10000,
        position: 'top-center',
      });
      return false;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    // Set current restaurant if not set
    if (!currentRestaurant && item.restaurantId) {
      setCurrentRestaurant({
        id: item.restaurantId,
        name: item.restaurantName || 'Restaurant',
      });
    }

    return true;
  };

  const clearCartAndAddItem = (item) => {
    setCartItems([{ ...item, quantity: 1 }]);
    setCurrentRestaurant({
      id: item.restaurantId,
      name: item.restaurantName || 'Restaurant',
    });
    toast.success(`Cart cleared. ${item.name} added!`);
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newItems = prev.filter((item) => item.id !== itemId);
      // Clear restaurant if cart becomes empty
      if (newItems.length === 0) {
        setCurrentRestaurant(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCurrentRestaurant(null);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const getCurrentRestaurant = () => currentRestaurant;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        currentRestaurant,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getCurrentRestaurant,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};