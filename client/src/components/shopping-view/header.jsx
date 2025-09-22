import {
  LogOut,
  Menu,
  ShoppingBag,
  UserCog,
  Search,
  Phone,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import logo from "@/assets/logo.png";
import { getHeaderClasses } from "@/utils/theme-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser, fetchUserProfile, fetchIncognitoUsers, loginAsIncognitoUser, loginAsMainUser } from "@/store/auth-slice";
import CustomCartDrawer from "./custom-cart-drawer";
import { useState, useRef, useEffect } from "react";
import RotatingMessages from "./rotating-messages.jsx";
import { fetchCartItems, clearCart } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import { useToast } from "../ui/use-toast";
import { getTempCartCount, restoreTempCartFromBackup } from "@/utils/tempCartManager";
import { resetCartCopyState } from "@/utils/cartCopyManager";


function ShoppingHeader() {
  const { user, incognitoUsers, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems, isLoading: cartIsLoading } = useSelector((state) => state.shopCart);
  const { currentTheme } = useSelector((state) => state.theme);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [openUserSheet, setOpenUserSheet] = useState(false);
  const [tempCartCount, setTempCartCount] = useState(0);
  const lastCartSheetToggleTime = useRef(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const messages = [
    "🔥 NEW ARRIVALS: Summer Collection 2024 is here!",
    "👗 EXCLUSIVE: 20% off all dresses with code SUMMER24",
    "✨ FREE SHIPPING on orders over ₹1000",
    "🎁 Buy 2 Get 1 Free on all accessories this week",
  ];

  // Track temp cart count for non-authenticated users
  useEffect(() => {
    const updateTempCartCount = () => {
      const count = getTempCartCount();
      setTempCartCount(count);
    };

    // Update on mount
    updateTempCartCount();

    // Listen for temp cart updates
    window.addEventListener('tempCartUpdated', updateTempCartCount);
    return () => window.removeEventListener('tempCartUpdated', updateTempCartCount);
  }, []);

  // Update temp cart count when authentication state changes
  useEffect(() => {
    console.log('Header: isAuthenticated changed to:', isAuthenticated);
    if (!isAuthenticated) {
      // Force update temp cart count when user logs out
      const count = getTempCartCount();
      console.log('Header: temp cart count after logout:', count);
      setTempCartCount(count);
    }
  }, [isAuthenticated]);

  // Calculate total cart count (temp cart + actual cart)
  const totalCartCount = isAuthenticated ? (cartItems?.length || 0) : tempCartCount;

  useEffect(() => {
    if (user && user.id) {
      dispatch(fetchIncognitoUsers());
    }
  }, [user?.id, dispatch]);

  const handleLogout = () => {
    // Reset cart copy state for current user
    if (user?.id) {
      resetCartCopyState(user.id);
    }

    // Clear the cart items immediately to prevent them from showing after logout
    dispatch(clearCart());

    // Force close the cart drawer if it's open
    if (openCartSheet) {
      setOpenCartSheet(false);
    }

    // Close user sheet if it's open
    if (openUserSheet) {
      setOpenUserSheet(false);
    }

    dispatch(logoutUser())
      .unwrap()
      .then((result) => {
        if (result.success) {
          // Clear any local storage cart data
          localStorage.removeItem('cartItems');
          sessionStorage.removeItem('cartItems');

          // Show success message
          toast({ title: "Logged out successfully" });

          // Navigate to home page
          navigate("/shop/home");

          // Restore temp cart items from backup and trigger refresh
          setTimeout(() => {
            const restoredItems = restoreTempCartFromBackup();
            console.log('Logout: Restored temp cart items:', restoredItems.length);

            // Update temp cart count
            const count = getTempCartCount();
            setTempCartCount(count);

            // Trigger temp cart refresh
            window.dispatchEvent(new CustomEvent('tempCartUpdated'));
          }, 100);
        }
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        toast({ title: "Logout failed", description: "Please try again.", variant: "destructive" });
      });
  };

  const handleSwitchProfile = (profileId, isMain = false) => {
    if (isMain) {
      // Switch back to the main account
      dispatch(loginAsMainUser())
        .unwrap()
        .then((result) => {
          toast({ title: "Switched to main account successfully" });
          // Refresh cart items using the new user's id
          if (result.user && result.user.id) {
            dispatch(fetchCartItems(result.user.id));
          }
        })
        .catch((error) => {
          console.error("Switch to main account failed:", error);
          toast({
            title: "Failed to switch to main account",
            description: "Please try again.",
            variant: "destructive",
          });
        });
    } else {
      // Switch to an incognito profile
      dispatch(loginAsIncognitoUser(profileId))
        .unwrap()
        .then((result) => {
          toast({ title: "Switched profile successfully" });
          // Refresh cart items using the new user's id
          if (result.user && result.user.id) {
            dispatch(fetchCartItems(result.user.id));
          }
        })
        .catch((error) => {
          console.error("Switch profile failed:", error);
          toast({
            title: "Failed to switch profile",
            description: "Please try again.",
            variant: "destructive",
          });
        });
    }
  };


  function MenuItems({ onCloseSheet }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [_, setSearchParams] = useSearchParams();

    function handleNavigate(getCurrentMenuItem) {
      sessionStorage.removeItem("filters");
      const currentFilter =
        getCurrentMenuItem.id !== "home" &&
        getCurrentMenuItem.id !== "collections" &&
        getCurrentMenuItem.id !== "new-arrivals" &&
        getCurrentMenuItem.id !== "contact"
          ? { category: [getCurrentMenuItem.id] }
          : null;

      sessionStorage.setItem("filters", JSON.stringify(currentFilter));
      location.pathname.includes("collections") && currentFilter !== null
        ? setSearchParams(new URLSearchParams(`?category=${getCurrentMenuItem.id}`))
        : navigate(getCurrentMenuItem.path);
      onCloseSheet();
    }

    return (
      <nav className="flex flex-col mb-3 gap-6">
        {shoppingViewHeaderMenuItems.map((menuItem) => (
          <div className="relative group" key={menuItem.id}>
            <Label onClick={() => handleNavigate(menuItem)} className="text-base uppercase tracking-wider font-medium cursor-pointer flex items-center">
              {menuItem.label}
              {menuItem.hasSubmenu && <ChevronDown className="ml-1 h-4 w-4" />}
            </Label>
            <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-foreground transition-all duration-300 group-hover:w-full"></span>
          </div>
        ))}
      </nav>
    );
  }

  // Mobile User Authentication Bottom Sheet Component
  function MobileUserSheet() {
    return (
      <Sheet open={openUserSheet} onOpenChange={setOpenUserSheet}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] bg-background text-foreground border-border rounded-t-xl">
          <div className="p-6">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <Avatar className="h-12 w-12 bg-card border border-border">
                    <AvatarFallback className="bg-card text-foreground font-medium">
                      {user.userName ? user.userName[0].toUpperCase() : ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">{user.userName || "Main Account"}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setOpenUserSheet(false);
                      navigate("/shop/account");
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left"
                  >
                    <UserCog className="h-5 w-5" />
                    <span>My Account</span>
                  </button>

                  {/* Incognito Users Section */}
                  {incognitoUsers && incognitoUsers.length > 0 && (
                    <>
                      <div className="pt-2 pb-1">
                        <p className="text-sm font-medium text-muted-foreground">Switch Account</p>
                      </div>
                      {user.isIncognito && (
                        <button
                          onClick={() => {
                            setOpenUserSheet(false);
                            handleSwitchProfile(null, true);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left"
                        >
                          <Avatar className="h-6 w-6 bg-card border border-border">
                            <AvatarFallback className="bg-card text-foreground font-medium text-sm">M</AvatarFallback>
                          </Avatar>
                          <span>Switch to Main Account</span>
                        </button>
                      )}
                      {incognitoUsers.map((incog) => (
                        <button
                          key={incog._id}
                          onClick={() => {
                            setOpenUserSheet(false);
                            handleSwitchProfile(incog._id);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left"
                        >
                          <Avatar className="h-6 w-6 bg-card border border-border">
                            <AvatarFallback className="bg-card text-foreground font-medium text-sm">
                              {incog.userName ? incog.userName[0].toUpperCase() : "I"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{incog.userName || "Incognito"}</span>
                        </button>
                      ))}
                    </>
                  )}

                  {!user.isIncognito && (
                    <button
                      onClick={() => {
                        setOpenUserSheet(false);
                        navigate("/auth/register-incognito");
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left"
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>Register for a Friend</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setOpenUserSheet(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center pb-4">
                  <h3 className="text-lg font-medium text-foreground mb-2">Welcome to DiabolicalXme!</h3>
                  <p className="text-sm text-muted-foreground">Sign in to access your account and orders</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setOpenUserSheet(false);
                      navigate("/auth/login");
                    }}
                    className="w-full flex items-center justify-center gap-3 p-3 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
                  >
                    <LogOut className="h-5 w-5 rotate-180" />
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpenUserSheet(false);
                      navigate("/auth/register");
                    }}
                    className="w-full flex items-center justify-center gap-3 p-3 border border-border rounded-md hover:bg-muted/30 transition-colors"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Create Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  function HeaderRightContent({ onCloseSheet }) {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    // Fetch user profile when authenticated but no user data
    useEffect(() => {
      if (isAuthenticated && !user) {
        dispatch(fetchUserProfile());
      }
    }, [isAuthenticated, user, dispatch]);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            className="relative group flex items-center"
            onClick={() => {
              if (cartIsLoading) return;
              const now = Date.now();
              if (now - lastCartSheetToggleTime.current > 300) {
                lastCartSheetToggleTime.current = now;
                setOpenCartSheet(true);
              }
            }}
          >
            <ShoppingBag className="h-5 w-5 text-foreground group-hover:opacity-80 transition-colors" />
            {totalCartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
            <span className="sr-only">Shopping Bag</span>
          </button>

        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-8 w-8 bg-card border border-border">
                  <AvatarFallback className="bg-card text-foreground font-medium text-sm">
                    {user.userName ? user.userName[0].toUpperCase() : ""}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm hidden md:block text-foreground">{user.userName || "Main Account"}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-card shadow-lg rounded-md border border-border">
              <DropdownMenuLabel className="text-sm text-muted-foreground">
                Hello, {user.userName || "Main Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => {
                onCloseSheet();
                navigate("/shop/account");
              }}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>My Account</span>
              </DropdownMenuItem>

              {/* If logged in as incognito, add an option to switch back to Main Account */}
              {user.isIncognito && (
                <>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuItem
                    className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
                    onClick={() => {
                      onCloseSheet();
                      handleSwitchProfile(null, true);
                    }}
                  >
                    <Avatar className="h-6 w-6 bg-card border border-border">
                      <AvatarFallback className="bg-card text-foreground font-medium text-sm">M</AvatarFallback>
                    </Avatar>
                    <span className="ml-2">Switch to Main Account</span>
                  </DropdownMenuItem>
                </>
              )}

              {incognitoUsers && incognitoUsers.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuLabel className="text-sm text-muted-foreground">Incognito Profiles</DropdownMenuLabel>
                  {incognitoUsers.map((incog) => (
                    <DropdownMenuItem
                      key={incog.id}
                      className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
                      onClick={() => {
                        onCloseSheet();
                        handleSwitchProfile(incog._id);
                      }}
                    >
                      <Avatar className="h-6 w-6 bg-card border border-border">
                        <AvatarFallback className="bg-card text-foreground font-medium text-sm">
                          {incog.userName ? incog.userName[0].toUpperCase() : "I"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-2">{incog.userName || "Incognito"}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {/* Only show Register for a Friend option for main users (not incognito) */}
              {!user.isIncognito && (
                <>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => {
                    onCloseSheet();
                    navigate("/auth/register-incognito");
                  }}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Register for a Friend</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => {
                onCloseSheet();
                handleLogout();
              }}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <UserPlus className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors hover:cursor-pointer" />
                <span className="text-sm hidden md:block">Sign In</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-card shadow-lg rounded-md border border-border">
              <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => {
                onCloseSheet();
                navigate("/auth/login");
              }}>
                <LogOut className="mr-2 h-4 w-4 rotate-180" />
                <span>Sign In</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => {
                onCloseSheet();
                navigate("/auth/register");
              }}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Create Account</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

  useEffect(() => {
    if (user?.id && !Boolean(cartItems?.length)) {
      dispatch(fetchCartItems(user.id));
    }
  }, [user?.id, dispatch, cartItems?.length]);

  useEffect(() => {
    if (user?.id && openCartSheet) {
      const now = Date.now();
      if (now - lastCartSheetToggleTime.current > 500) {
        lastCartSheetToggleTime.current = now;
        dispatch(fetchCartItems(user.id));
      }
    }
  }, [openCartSheet, user?.id, dispatch]);

  // Get theme-aware header classes using centralized utility
  const headerClasses = getHeaderClasses(currentTheme);

  return (
    <>
      <header className={headerClasses.header}>
        {/* Top announcement bar */}
        {/* <div className="bg-foreground text-background py-2 px-4">
          <div className="max-w-[1440px] mx-auto flex justify-between items-center">
            <div className="hidden md:flex items-center space-x-4">
              <a href="tel:+919944783389" className="text-xs flex items-center hover:opacity-80 transition-colors">
                <Phone className="h-3 w-3 mr-1" />
                +91 9944783389
              </a>
              <div className="text-xs">|</div>
              <a href="mailto:diabolicalxme@gmail.com" className="text-xs hover:opacity-80 transition-colors">
                diabolicalxme@gmail.com
              </a>
            </div>
            <div className="w-full md:w-auto flex justify-center">
              <RotatingMessages messages={messages} interval={5000} className="w-full" />
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <a href="https://www.instagram.com/diabolicalxme" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-colors">
                <FaInstagram size={17} />
              </a>
              <a href="https://www.facebook.com/diabolicalxme" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-colors">
                <FaFacebook size={17} />
              </a>
              <a href="https://wa.me/9944783389" className="hover:opacity-80 transition-colors" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp size={17} />
              </a>
            </div>
          </div>
        </div> */}
        {/* Main header */}
        <div className={headerClasses.main}>
          <div className="max-w-[1440px] mx-auto flex h-20 items-center relative px-4 md:px-6">
            {/* Left Section - Menu Button */}
            <div className="flex items-center">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs p-0 bg-background text-foreground border-border">
                  <div className="p-6">
                    <Link
                      to="/shop/home"
                      className="block mb-6"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <img src={logo} alt="Fashion Store Logo" className="h-16" />
                    </Link>
                    <MenuItems onCloseSheet={() => setIsSheetOpen(false)} />
                    <div className="mt-8 pt-6 border-t border-border">
                      <HeaderRightContent onCloseSheet={() => setIsSheetOpen(false)} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Center Section - Logo (Absolutely Centered) */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link to="/shop/home" className="flex items-center">
                <img src={logo} alt="Fashion Store Logo" className="h-14 md:h-18" />
              </Link>
            </div>

            {/* Right Section - User Actions */}
            <div className="ml-auto">
              {/* Desktop Icons - Spaced Out */}
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-2 cursor-pointer p-2">
                        <Avatar className="h-8 w-8 bg-card border border-border">
                          <AvatarFallback className="bg-card text-foreground font-medium text-sm">
                            {user.userName ? user.userName[0].toUpperCase() : ""}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground">{user.userName || "Main Account"}</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 bg-card shadow-lg rounded-md border border-border">
                      <DropdownMenuLabel className="text-sm text-muted-foreground">
                        Hello, {user.userName || "Main Account"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border my-1" />
                      <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => {
                        navigate("/shop/account");
                      }}>
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </DropdownMenuItem>

                      {/* Incognito Users Section */}
                      {incognitoUsers && incognitoUsers.length > 0 && (
                        <>
                          <DropdownMenuSeparator className="bg-border my-1" />
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Switch Account
                          </DropdownMenuLabel>
                          {user.isIncognito && (
                            <DropdownMenuItem
                              className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
                              onClick={() => {
                                handleSwitchProfile(null, true);
                              }}
                            >
                              <Avatar className="h-6 w-6 bg-card border border-border">
                                <AvatarFallback className="bg-card text-foreground font-medium text-sm">M</AvatarFallback>
                              </Avatar>
                              <span className="ml-2">Switch to Main Account</span>
                            </DropdownMenuItem>
                          )}
                          {incognitoUsers.map((incog) => (
                            <DropdownMenuItem
                              key={incog._id}
                              className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
                              onClick={() => {
                                handleSwitchProfile(incog._id);
                              }}
                            >
                              <Avatar className="h-6 w-6 bg-card border border-border">
                                <AvatarFallback className="bg-card text-foreground font-medium text-sm">
                                  {incog.userName ? incog.userName[0].toUpperCase() : "I"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="ml-2">{incog.userName || "Incognito"}</span>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}

                      {!user.isIncognito && (
                        <>
                          <DropdownMenuSeparator className="bg-border my-1" />
                          <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => {
                            navigate("/auth/register-incognito");
                          }}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>Register for a Friend</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator className="bg-border my-1" />
                      <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-2 cursor-pointer p-2">
                        <UserPlus className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors hover:cursor-pointer" />
                        <span className="text-sm">Sign In</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 bg-card shadow-lg rounded-md border border-border">
                      <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => {
                        navigate("/auth/login");
                      }}>
                        <LogOut className="mr-2 h-4 w-4 rotate-180" />
                        <span>Sign In</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border my-1" />
                      <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => {
                        navigate("/auth/register");
                      }}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Create Account</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Desktop Search Button */}
                <button onClick={() => {
                  setIsSheetOpen(false); // Close the menu sidebar
                  navigate('/shop/search');
                }} className="relative group p-2">
                  <Search className="h-5 w-5 text-foreground group-hover:opacity-80 transition-colors" />
                  <span className="sr-only">Search</span>
                </button>

                {/* Desktop Cart Button */}
                <button
                  className="relative group"
                  onClick={() => {
                    setIsSheetOpen(false); // Close the menu sidebar
                    if (cartIsLoading) return;
                    const now = Date.now();
                    if (now - lastCartSheetToggleTime.current > 300) {
                      lastCartSheetToggleTime.current = now;
                      setOpenCartSheet(true);
                    }
                  }}
                >
                  <ShoppingBag className="h-5 w-5 text-foreground group-hover:opacity-80 transition-colors" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {totalCartCount}
                    </span>
                  )}
                  <span className="sr-only">Shopping Bag</span>
                </button>
              </div>


              {/* Mobile Icons - Tightly Grouped */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setOpenUserSheet(true)}
                  className="relative group px-1"
                >
                  {user ? (
                    <Avatar className="h-8 w-8 bg-card border border-border">
                      <AvatarFallback className="bg-card text-foreground font-medium text-xs">
                        {user.userName ? user.userName[0].toUpperCase() : ""}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <UserPlus className="h-8 w-8 text-foreground/70 group-hover:text-foreground transition-colors" />
                  )}
                  <span className="sr-only">User Account</span>
                </button>

                <button onClick={() => {
                  setIsSheetOpen(false); // Close the menu sidebar
                  navigate('/shop/search');
                }} className="relative group px-1">
                  <Search className="h-5 w-5 text-foreground group-hover:opacity-80 transition-colors" />
                  <span className="sr-only">Search</span>
                </button>

                <button
                  className="relative group px-1"
                  onClick={() => {
                    setIsSheetOpen(false); // Close the menu sidebar
                    if (cartIsLoading) return;
                    const now = Date.now();
                    if (now - lastCartSheetToggleTime.current > 300) {
                      lastCartSheetToggleTime.current = now;
                      setOpenCartSheet(true);
                    }
                  }}
                >
                  <ShoppingBag className="h-5 w-5 text-foreground group-hover:opacity-80 transition-colors" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {totalCartCount}
                    </span>
                  )}
                  <span className="sr-only">Shopping Bag</span>
                </button>
              </div>


              <CustomCartDrawer isOpen={openCartSheet} onClose={() => setOpenCartSheet(false)} cartItems={cartItems || []} isLoading={cartItems.length === 0 ? cartIsLoading : false} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile User Authentication Bottom Sheet */}
      <MobileUserSheet />

      <div className="h-[calc(2.5rem)]"></div>
      {/* Hidden on mobile, visible on desktop */}
      <div className="hidden">
        <MenuItems onCloseSheet={() => {}} />
      </div>
    </>
  );
}

export default ShoppingHeader;