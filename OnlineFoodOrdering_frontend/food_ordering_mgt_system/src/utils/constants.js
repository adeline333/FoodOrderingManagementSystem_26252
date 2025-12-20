// User Roles
export const USER_ROLES = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  RESTAURANT_OWNER: "RESTAURANT_OWNER",
  DELIVERY_PERSON: "DELIVERY_PERSON",
};

export const USER_ROLE_OPTIONS = [
  { value: "CUSTOMER", label: "Customer" },
  { value: "RESTAURANT_OWNER", label: "Restaurant Owner" },
  { value: "DELIVERY_PERSON", label: "Delivery Person" },
  { value: "ADMIN", label: "Admin" },
];

// Order Statuses
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Payment Statuses
export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

export const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

// Payment Methods
export const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
];

// Food Categories
export const FOOD_CATEGORY_OPTIONS = [
  { value: "APPETIZER", label: "Appetizer" },
  { value: "MAIN_COURSE", label: "Main Course" },
  { value: "DESSERT", label: "Dessert" },
  { value: "BEVERAGE", label: "Beverage" },
  { value: "SIDE_DISH", label: "Side Dish" },
];

// Location Types
export const LOCATION_TYPE_OPTIONS = [
  { value: "PROVINCE", label: "Province" },
  { value: "DISTRICT", label: "District" },
  { value: "SECTOR", label: "Sector" },
  { value: "CELL", label: "Cell" },
  { value: "VILLAGE", label: "Village" },
];
