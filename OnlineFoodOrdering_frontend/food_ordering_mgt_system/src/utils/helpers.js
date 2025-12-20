// Format currency
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "RWF 0";
  return `RWF ${Number(amount).toLocaleString("en-RW")}`;
};

// Format date
export const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format datetime
export const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get full name
export const getFullName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown";
};

// Get status color class
export const getStatusColor = (status, type = "order") => {
  const orderColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PREPARING: "bg-purple-100 text-purple-800",
    READY: "bg-indigo-100 text-indigo-800",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const paymentColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-purple-100 text-purple-800",
  };

  const colors = type === "payment" ? paymentColors : orderColors;
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Debounce function
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};
