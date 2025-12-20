package com.example.OnlineFoodOrdering.dto;

import java.util.List;

public class SearchResult {
    private String type;
    private Long id;
    private String title;
    private String subtitle;
    private String description;
    private String url;
    private String imageUrl;

    public SearchResult() {}

    public SearchResult(String type, Long id, String title, String subtitle, String description, String url, String imageUrl) {
        this.type = type;
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.description = description;
        this.url = url;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    // Response wrapper for grouped results
    public static class GlobalSearchResponse {
        private List<SearchResult> restaurants;
        private List<SearchResult> menuItems;
        private List<SearchResult> orders;
        private List<SearchResult> users;
        private List<SearchResult> locations;
        private List<SearchResult> payments;
        private int totalResults;

        public GlobalSearchResponse() {}

        public GlobalSearchResponse(List<SearchResult> restaurants, List<SearchResult> menuItems,
                List<SearchResult> orders, List<SearchResult> users,
                List<SearchResult> locations, List<SearchResult> payments) {
            this.restaurants = restaurants;
            this.menuItems = menuItems;
            this.orders = orders;
            this.users = users;
            this.locations = locations;
            this.payments = payments;
            this.totalResults = restaurants.size() + menuItems.size() + orders.size()
                    + users.size() + locations.size() + payments.size();
        }

        public List<SearchResult> getRestaurants() { return restaurants; }
        public void setRestaurants(List<SearchResult> restaurants) { this.restaurants = restaurants; }

        public List<SearchResult> getMenuItems() { return menuItems; }
        public void setMenuItems(List<SearchResult> menuItems) { this.menuItems = menuItems; }

        public List<SearchResult> getOrders() { return orders; }
        public void setOrders(List<SearchResult> orders) { this.orders = orders; }

        public List<SearchResult> getUsers() { return users; }
        public void setUsers(List<SearchResult> users) { this.users = users; }

        public List<SearchResult> getLocations() { return locations; }
        public void setLocations(List<SearchResult> locations) { this.locations = locations; }

        public List<SearchResult> getPayments() { return payments; }
        public void setPayments(List<SearchResult> payments) { this.payments = payments; }

        public int getTotalResults() { return totalResults; }
        public void setTotalResults(int totalResults) { this.totalResults = totalResults; }
    }
}
