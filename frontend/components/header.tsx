import CartService from "@services/CartService";
import {
  BaggageClaim,
  Home,
  LogIn,
  LogOut,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "types";

const Header = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString !== null) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

  const handleCart = async () => {
    if (!loggedInUser) {
      alert("Please log in to view your cart.");
      router.push("/login");
    }

    const response = await CartService.getCartByUserId(
      loggedInUser?.email ?? ""
    );

    const exisitingCart = await response.json();

    if (exisitingCart) {
      router.push("/cart");
    } else {
      await CartService.createCart({
        userId: loggedInUser?.email ?? "",
        items: [],
        updatedAt: new Date(),
      });
      router.push("/cart");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    setTimeout(() => {
      router.push("/login");
    }, 500);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-7 w-7" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
              Shopy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center gap-1.5 font-medium hover:text-purple-200 transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>

            {loggedInUser && (
              <>
                <Link
                  href="/users"
                  className="flex items-center gap-1.5 font-medium hover:text-purple-200 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Users
                </Link>

                <Link
                  href="/products"
                  className="flex items-center gap-1.5 font-medium hover:text-purple-200 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Products
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center gap-1.5 font-medium hover:text-purple-200 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  orders
                </Link>

                <button
                  onClick={handleCart}
                  className="flex items-center gap-1.5 font-medium hover:text-purple-200 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            )}

            {(loggedInUser?.role === "seller" ||
              loggedInUser?.role === "admin") && (
              <Link
                href="/myproducts"
                className="flex items-center gap-1.5 font-medium hover:text-purple-200 transition-colors"
              >
                <BaggageClaim className="h-4 w-4" />
                My products
              </Link>
            )}

            {!loggedInUser && (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-3 pt-3 border-t border-white/10">
            <ul className="flex flex-col space-y-3">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </li>

              {loggedInUser && (
                <>
                  <li>
                    <Link
                      href="/users"
                      className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      Users
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products"
                      className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Products
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </li>
                </>
              )}

              {!loggedInUser && (
                <li>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
