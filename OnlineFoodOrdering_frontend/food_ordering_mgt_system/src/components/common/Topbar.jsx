import { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, Search, Bell, User, LogOut, Settings, X, Store, UtensilsCrossed, ShoppingBag, Loader2, MapPin, CreditCard, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../services/api';

export const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    const handleGlobalKeydown = (event) => {
      // Cmd+K or Ctrl+K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = searchRef.current?.querySelector('input');
        if (searchInput) {
          searchInput.focus();
          setShowSearchResults(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleGlobalKeydown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalKeydown);
    };
  }, []);

  // Debounced search
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const response = await searchApi.globalSearch(query || ''); // Allow empty query for suggestions
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(debounce(performSearch, 150), []); // Reduced from 300ms to 150ms

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedResultIndex(-1); // Reset selection when typing
    debouncedSearch(value);
  };

  // Get all results in a flat array for keyboard navigation
  const getAllResults = () => {
    if (!searchResults) return [];
    return [
      ...(searchResults.restaurants || []),
      ...(searchResults.menuItems || []),
      ...(searchResults.orders || []),
      ...(searchResults.users || []),
      ...(searchResults.locations || []),
      ...(searchResults.payments || [])
    ];
  };

  const handleKeyDown = (e) => {
    if (!showSearchResults) return;
    
    const allResults = getAllResults();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResultIndex(prev => 
          prev < allResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedResultIndex >= 0 && allResults[selectedResultIndex]) {
          handleResultClick(allResults[selectedResultIndex]);
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSearchQuery('');
        setSelectedResultIndex(-1);
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResultClick = (result) => {
    setShowSearchResults(false);
    setSearchQuery('');
    // Navigate with search params to highlight the specific item
    const url = `${result.url}?highlight=${result.id}&search=${encodeURIComponent(result.title)}`;
    navigate(url);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowSearchResults(false);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'restaurant':
        return <Store className="w-4 h-4 text-orange-500" />;
      case 'menuItem':
        return <UtensilsCrossed className="w-4 h-4 text-green-500" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'user':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-red-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const hasResults = searchResults && (
    searchResults.restaurants?.length > 0 ||
    searchResults.menuItems?.length > 0 ||
    searchResults.orders?.length > 0 ||
    searchResults.users?.length > 0 ||
    searchResults.locations?.length > 0 ||
    searchResults.payments?.length > 0
  );

  return (
    <header className="h-16 bg-white border-b border-orange-100 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-orange-50 text-gray-600 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={() => setShowSearchResults(true)}
          className="p-2 rounded-xl hover:bg-orange-50 text-gray-600 md:hidden transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="hidden md:block relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search restaurants, menu items, orders... (Try: 'p' for pizza)"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setShowSearchResults(true);
                if (!searchQuery) performSearch(''); // Show suggestions when empty
              }}
              className="w-64 lg:w-96 pl-10 pr-10 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5 animate-spin" />
            )}
            {!isSearching && searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-orange-100 max-h-96 overflow-y-auto z-50">
              {!hasResults && !isSearching && (
                <div className="p-6 text-center text-gray-500">
                  <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium">No results found</p>
                  <p className="text-sm">Try searching for something else</p>
                </div>
              )}

              {hasResults && (
                <div className="py-2">
                  {/* Restaurants */}
                  {searchResults.restaurants?.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-50">
                        Restaurants
                      </div>
                      {searchResults.restaurants.map((result, index) => (
                        <button
                          key={`restaurant-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className={`w-full px-4 py-3 flex items-start gap-3 transition-colors text-left ${
                            selectedResultIndex === index ? 'bg-orange-100' : 'hover:bg-orange-50'
                          }`}
                        >
                          <div className="mt-0.5">{getIconForType(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                            <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                            {result.description && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{result.description}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Menu Items */}
                  {searchResults.menuItems?.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-50">
                        Menu Items
                      </div>
                      {searchResults.menuItems.map((result) => (
                        <button
                          key={`menuItem-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-orange-50 transition-colors text-left"
                        >
                          <div className="mt-0.5">{getIconForType(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                            <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                            {result.description && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{result.description}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Orders */}
                  {searchResults.orders?.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-50">
                        Orders
                      </div>
                      {searchResults.orders.map((result) => (
                        <button
                          key={`order-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-orange-50 transition-colors text-left"
                        >
                          <div className="mt-0.5">{getIconForType(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                            <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                            {result.description && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{result.description}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Users */}
                  {searchResults.users?.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-50">
                        Users
                      </div>
                      {searchResults.users.map((result) => (
                        <button
                          key={`user-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-orange-50 transition-colors text-left"
                        >
                          <div className="mt-0.5">{getIconForType(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                            <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                            {result.description && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{result.description}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Locations */}
                  {searchResults.locations?.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-50">
                        Locations
                      </div>
                      {searchResults.locations.map((result) => (
                        <button
                          key={`location-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-orange-50 transition-colors text-left"
                        >
                          <div className="mt-0.5">{getIconForType(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                            <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                            {result.description && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{result.description}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Payments */}
                  {searchResults.payments?.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-50">
                        Payments
                      </div>
                      {searchResults.payments.map((result) => (
                        <button
                          key={`payment-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-orange-50 transition-colors text-left"
                        >
                          <div className="mt-0.5">{getIconForType(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                            <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                            {result.description && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{result.description}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Total Results Footer */}
                  <div className="px-4 py-2 text-xs text-center text-gray-400 border-t border-gray-100 bg-gray-50">
                    {searchResults.totalResults} result{searchResults.totalResults !== 1 ? 's' : ''} found
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Search Modal */}
        {showSearchResults && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (!searchQuery) performSearch(''); // Show suggestions when empty
                    }}
                    autoFocus
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                  <button
                    onClick={() => {
                      setShowSearchResults(false);
                      clearSearch();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-96">
                {searchQuery.length === 0 && !isSearching && (
                  <div className="p-4 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium mb-1">Popular Suggestions</p>
                    <p className="text-xs text-gray-400">Start typing to search everything</p>
                  </div>
                )}

                {!hasResults && !isSearching && searchQuery.length >= 1 && (
                  <div className="p-6 text-center text-gray-500">
                    <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">No results found</p>
                    <p className="text-sm">Try searching for something else</p>
                  </div>
                )}

                {isSearching && (
                  <div className="p-6 text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 text-orange-500 animate-spin" />
                    <p className="text-gray-500">Searching...</p>
                  </div>
                )}

                {hasResults && (
                  <div className="py-2">
                    {/* Mobile Results */}
                    {searchResults.restaurants?.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-50">
                          Restaurants
                        </div>
                        {searchResults.restaurants.map((result) => (
                          <button
                            key={`mobile-restaurant-${result.id}`}
                            onClick={() => {
                              handleResultClick(result);
                              setShowSearchResults(false);
                            }}
                            className="w-full px-4 py-3 flex items-start gap-3 hover:bg-orange-50 transition-colors text-left"
                          >
                            <div className="mt-0.5">{getIconForType(result.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                              <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                              {result.description && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">{result.description}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.menuItems?.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-50">
                          Menu Items
                        </div>
                        {searchResults.menuItems.map((result) => (
                          <button
                            key={`mobile-menuItem-${result.id}`}
                            onClick={() => {
                              handleResultClick(result);
                              setShowSearchResults(false);
                            }}
                            className="w-full px-4 py-3 flex items-start gap-3 hover:bg-orange-50 transition-colors text-left"
                          >
                            <div className="mt-0.5">{getIconForType(result.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                              <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                              {result.description && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">{result.description}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.totalResults > 0 && (
                      <div className="px-4 py-2 text-xs text-center text-gray-400 border-t border-gray-100 bg-gray-50">
                        {searchResults.totalResults} result{searchResults.totalResults !== 1 ? 's' : ''} found
                      </div>
                    )}
                  </div>
                )}

                {searchQuery.length === 0 && !isSearching && (
                  <div className="p-4 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium mb-1">Popular Suggestions</p>
                    <p className="text-xs text-gray-400">Start typing to search everything</p>
                  </div>
                )}

                {searchQuery.length < 1 && ( // Changed from 2 to 1
                  <div className="p-6 text-center text-gray-400">
                    <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Start typing to search</p> {/* Updated message */}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2.5 rounded-xl hover:bg-orange-50 relative transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-orange-50 transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <span className="hidden md:block text-sm font-semibold text-gray-700">
              {user?.firstName || 'User'}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-orange-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-orange-100">
                <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                >
                  <User className="w-4 h-4 text-orange-500" />
                  Profile
                </button>
                <button
                  onClick={() => { setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-orange-500" />
                  Settings
                </button>
              </div>
              <div className="border-t border-orange-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
