package com.example.OnlineFoodOrdering.service;

import com.example.OnlineFoodOrdering.dto.SearchResult;
import com.example.OnlineFoodOrdering.dto.SearchResult.GlobalSearchResponse;
import com.example.OnlineFoodOrdering.entity.Location;
import com.example.OnlineFoodOrdering.entity.MenuItem;
import com.example.OnlineFoodOrdering.entity.Order;
import com.example.OnlineFoodOrdering.entity.Payment;
import com.example.OnlineFoodOrdering.entity.Restaurant;
import com.example.OnlineFoodOrdering.entity.User;
import com.example.OnlineFoodOrdering.repository.LocationRepository;
import com.example.OnlineFoodOrdering.repository.MenuItemRepository;
import com.example.OnlineFoodOrdering.repository.OrderRepository;
import com.example.OnlineFoodOrdering.repository.PaymentRepository;
import com.example.OnlineFoodOrdering.repository.RestaurantRepository;
import com.example.OnlineFoodOrdering.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GlobalSearchService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private static final int MAX_RESULTS_PER_CATEGORY = 10; // Increased from 5

    public GlobalSearchResponse search(String query) {
        if (query == null || query.trim().isEmpty()) {
            // Return popular suggestions when no query
            return getPopularSuggestions();
        }

        String searchTerm = query.trim().toLowerCase();
        
        // For single character searches, prioritize popular/recent items
        int maxResults = searchTerm.length() == 1 ? 5 : MAX_RESULTS_PER_CATEGORY;

        // Parallel search for better performance
        List<SearchResult> restaurants = searchRestaurants(searchTerm, maxResults);
        List<SearchResult> menuItems = searchMenuItems(searchTerm, maxResults);
        List<SearchResult> orders = searchOrders(searchTerm, maxResults);
        List<SearchResult> users = searchUsers(searchTerm, maxResults);
        List<SearchResult> locations = searchLocations(searchTerm, maxResults);
        List<SearchResult> payments = searchPayments(searchTerm, maxResults);

        return new GlobalSearchResponse(restaurants, menuItems, orders, users, locations, payments);
    }

    private GlobalSearchResponse getPopularSuggestions() {
        // Get popular restaurants (first 3)
        List<SearchResult> popularRestaurants = restaurantRepository.findAll()
                .stream()
                .limit(3)
                .map(this::mapRestaurantToSearchResult)
                .collect(Collectors.toList());

        // Get popular menu items (first 5)
        List<SearchResult> popularMenuItems = menuItemRepository.findAll()
                .stream()
                .limit(5)
                .map(this::mapMenuItemToSearchResult)
                .collect(Collectors.toList());

        // Get recent orders (first 3)
        List<SearchResult> recentOrders = orderRepository.findAll()
                .stream()
                .limit(3)
                .map(this::mapOrderToSearchResult)
                .collect(Collectors.toList());

        return new GlobalSearchResponse(
                popularRestaurants, 
                popularMenuItems, 
                recentOrders, 
                new ArrayList<>(), // No users in suggestions
                new ArrayList<>(), // No locations in suggestions
                new ArrayList<>()  // No payments in suggestions
        );
    }

    private List<SearchResult> searchRestaurants(String searchTerm, int maxResults) {
        return restaurantRepository.searchRestaurants(searchTerm)
                .stream()
                .limit(maxResults)
                .map(this::mapRestaurantToSearchResult)
                .collect(Collectors.toList());
    }

    private List<SearchResult> searchMenuItems(String searchTerm, int maxResults) {
        // Search by name and description
        List<MenuItem> byName = menuItemRepository.findByNameContainingIgnoreCase(searchTerm);
        List<MenuItem> byDescription = menuItemRepository.findByDescriptionContainingIgnoreCase(searchTerm);
        
        // Search by category enum
        List<MenuItem> byCategory = new ArrayList<>();
        try {
            for (MenuItem.FoodCategory category : MenuItem.FoodCategory.values()) {
                if (category.name().toLowerCase().contains(searchTerm)) {
                    byCategory.addAll(menuItemRepository.findByCategory(category));
                }
            }
        } catch (Exception e) {
            // Ignore category search errors
        }
        
        // Combine and deduplicate results
        Set<MenuItem> allItems = new HashSet<>();
        allItems.addAll(byName);
        allItems.addAll(byDescription);
        allItems.addAll(byCategory);
        
        return allItems.stream()
                .limit(maxResults)
                .map(this::mapMenuItemToSearchResult)
                .collect(Collectors.toList());
    }

    private List<SearchResult> searchOrders(String searchTerm, int maxResults) {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .filter(order -> matchesOrder(order, searchTerm))
                .limit(maxResults)
                .map(this::mapOrderToSearchResult)
                .collect(Collectors.toList());
    }

    private boolean matchesOrder(Order order, String searchTerm) {
        if (order.getId().toString().contains(searchTerm)) return true;
        if (order.getStatus() != null && order.getStatus().name().toLowerCase().contains(searchTerm)) return true;
        if (order.getCustomer() != null) {
            String customerName = (order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName()).toLowerCase();
            if (customerName.contains(searchTerm)) return true;
        }
        return false;
    }

    private SearchResult mapRestaurantToSearchResult(Restaurant restaurant) {
        String locationName = restaurant.getLocation() != null ? restaurant.getLocation().getName() : "";
        return new SearchResult(
                "restaurant",
                restaurant.getId(),
                restaurant.getName(),
                locationName,
                truncateDescription(restaurant.getDescription()),
                "/restaurants/" + restaurant.getId() + "/menu",
                null
        );
    }

    private SearchResult mapMenuItemToSearchResult(MenuItem menuItem) {
        String restaurantName = menuItem.getRestaurant() != null ? menuItem.getRestaurant().getName() : "";
        String priceStr = menuItem.getPrice() != null ? String.format("RWF %.0f", menuItem.getPrice()) : "";
        Long restaurantId = menuItem.getRestaurant() != null ? menuItem.getRestaurant().getId() : null;
        String url = restaurantId != null ? "/restaurants/" + restaurantId + "/menu" : "/menu";
        return new SearchResult(
                "menuItem",
                menuItem.getId(),
                menuItem.getName(),
                restaurantName + " • " + priceStr,
                truncateDescription(menuItem.getDescription()),
                url,
                menuItem.getImageUrl()
        );
    }

    private SearchResult mapOrderToSearchResult(Order order) {
        String customerName = order.getCustomer() != null
                ? order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName()
                : "Unknown";
        String statusStr = order.getStatus() != null ? order.getStatus().name() : "";
        String amountStr = order.getTotalAmount() != null ? String.format("RWF %.0f", order.getTotalAmount()) : "";
        return new SearchResult(
                "order",
                order.getId(),
                "Order #" + order.getId(),
                customerName + " • " + statusStr,
                amountStr,
                "/orders",
                null
        );
    }

    private List<SearchResult> searchUsers(String searchTerm, int maxResults) {
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(user -> matchesUser(user, searchTerm))
                .limit(maxResults)
                .map(this::mapUserToSearchResult)
                .collect(Collectors.toList());
    }

    private boolean matchesUser(User user, String searchTerm) {
        if (user.getId().toString().contains(searchTerm)) return true;
        if (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(searchTerm)) return true;
        if (user.getLastName() != null && user.getLastName().toLowerCase().contains(searchTerm)) return true;
        if (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchTerm)) return true;
        if (user.getPhone() != null && user.getPhone().toLowerCase().contains(searchTerm)) return true;
        if (user.getRole() != null && user.getRole().name().toLowerCase().contains(searchTerm)) return true;
        return false;
    }

    private SearchResult mapUserToSearchResult(User user) {
        String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + " " +
                (user.getLastName() != null ? user.getLastName() : "");
        String roleStr = user.getRole() != null ? user.getRole().name() : "";
        String locationStr = user.getLocation() != null ? user.getLocation().getName() : "";
        return new SearchResult(
                "user",
                user.getId(),
                fullName.trim(),
                user.getEmail() + " • " + roleStr,
                locationStr,
                "/users",
                null
        );
    }

    private List<SearchResult> searchLocations(String searchTerm, int maxResults) {
        return locationRepository.searchLocations(searchTerm)
                .stream()
                .limit(maxResults)
                .map(this::mapLocationToSearchResult)
                .collect(Collectors.toList());
    }

    private SearchResult mapLocationToSearchResult(Location location) {
        String typeStr = location.getType() != null ? location.getType().name() : "";
        String parentName = location.getParent() != null ? location.getParent().getName() : "";
        return new SearchResult(
                "location",
                location.getId(),
                location.getName(),
                typeStr + (parentName.isEmpty() ? "" : " • " + parentName),
                location.getCode(),
                "/locations",
                null
        );
    }

    private List<SearchResult> searchPayments(String searchTerm, int maxResults) {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .filter(payment -> matchesPayment(payment, searchTerm))
                .limit(maxResults)
                .map(this::mapPaymentToSearchResult)
                .collect(Collectors.toList());
    }

    private boolean matchesPayment(Payment payment, String searchTerm) {
        if (payment.getId().toString().contains(searchTerm)) return true;
        if (payment.getTransactionId() != null && payment.getTransactionId().toLowerCase().contains(searchTerm)) return true;
        if (payment.getMethod() != null && payment.getMethod().name().toLowerCase().contains(searchTerm)) return true;
        if (payment.getStatus() != null && payment.getStatus().name().toLowerCase().contains(searchTerm)) return true;
        if (payment.getOrder() != null && payment.getOrder().getId().toString().contains(searchTerm)) return true;
        return false;
    }

    private SearchResult mapPaymentToSearchResult(Payment payment) {
        String statusStr = payment.getStatus() != null ? payment.getStatus().name() : "";
        String methodStr = payment.getMethod() != null ? payment.getMethod().name() : "";
        String amountStr = payment.getAmount() != null ? String.format("RWF %.0f", payment.getAmount()) : "";
        String orderId = payment.getOrder() != null ? "Order #" + payment.getOrder().getId() : "";
        return new SearchResult(
                "payment",
                payment.getId(),
                "Payment #" + payment.getId(),
                orderId + " • " + statusStr,
                amountStr + " • " + methodStr,
                "/payments",
                null
        );
    }

    private String truncateDescription(String description) {
        if (description == null) return "";
        if (description.length() <= 100) return description;
        return description.substring(0, 97) + "...";
    }
}
