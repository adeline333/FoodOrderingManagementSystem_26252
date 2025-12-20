export const Footer = () => {
  return (
    <footer className="h-14 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-100 flex items-center justify-center px-6">
      <p className="text-sm text-gray-500">
        © {new Date().getFullYear()} <span className="font-semibold text-orange-600">FoodOrder</span>. Made with ❤️ for food lovers.
      </p>
    </footer>
  );
};

export default Footer;