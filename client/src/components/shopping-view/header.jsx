import {
  LogOut,
  Menu,
  ShoppingBag,
  UserCog,
  Search,
  Phone,
  ChevronDown,
  UserPlus,
  Instagram,
  Facebook,
} from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser, fetchIncognitoUsers, loginAsIncognitoUser, loginAsMainUser } from "@/store/auth-slice";
import CustomCartDrawer from "./custom-cart-drawer";
import { useState, useRef, useEffect } from "react";
import RotatingMessages from "./rotating-messages.jsx";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { FaWhatsapp } from "react-icons/fa";
import { useToast } from "../ui/use-toast";


function ShoppingHeader() {
  const { isAuthenticated, user, incognitoUsers } = useSelector((state) => state.auth);
  const { cartItems, isLoading: cartIsLoading } = useSelector((state) => state.shopCart);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);
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

  useEffect(() => {
    if (user && user.id) {
      dispatch(fetchIncognitoUsers());
    }
  }, [user?.id, dispatch]);


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
    const [searchParams, setSearchParams] = useSearchParams();

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
      <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
        {shoppingViewHeaderMenuItems.map((menuItem) => (
          <div className="relative group" key={menuItem.id}>
            <Label onClick={() => handleNavigate(menuItem)} className="text-base uppercase tracking-wider font-medium cursor-pointer flex items-center">
              {menuItem.label}
              {menuItem.hasSubmenu && <ChevronDown className="ml-1 h-4 w-4" />}
            </Label>
            <span className="hidden md:block absolute left-0 bottom-[-4px] w-0 h-[2px] bg-foreground transition-all duration-300 group-hover:w-full"></span>
          </div>
        ))}
      </nav>
    );
  }

  function HeaderRightContent() {
    const navigate = useNavigate();
    const handleLogout = () => {
      dispatch(logoutUser())
        .unwrap()
        .then((result) => {
          if (result.success) toast({ title: "Logged out successfully" });
        })
        .catch((error) => {
          console.error("Logout failed:", error);
          toast({ title: "Logout failed", description: "Please try again.", variant: "destructive" });
        });
    };

    return (
      <div className="flex lg:items-center lg:flex-row flex-col gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/shop/search')} className="relative group">
            <Search className="h-5 w-5 text-foreground group-hover:opacity-80 transition-colors" />
            <span className="sr-only">Search</span>
          </button>
          <button
            className="relative group flex items-center"
            onClick={(e) => {
              if (cartIsLoading) return;
              const now = Date.now();
              if (now - lastCartSheetToggleTime.current > 300) {
                lastCartSheetToggleTime.current = now;
                setOpenCartSheet(true);
              }
            }}
          >
            <ShoppingBag className="h-5 w-5 text-foreground group-hover:opacity-80 transition-colors" />
            {cartItems?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
            <span className="sr-only">Shopping Bag</span>
          </button>
          <CustomCartDrawer isOpen={openCartSheet} onClose={() => setOpenCartSheet(false)} cartItems={cartItems || []} isLoading={cartItems.length === 0 ? cartIsLoading : false} />
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
              <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => navigate("/shop/account")}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>My Account</span>
              </DropdownMenuItem>

              {/* If logged in as incognito, add an option to switch back to Main Account */}
              {user.isIncognito && (
                <>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuItem
                    className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
                    onClick={() => handleSwitchProfile(null, true)}
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
                      onClick={() => handleSwitchProfile(incog._id)}
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
                  <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => navigate("/auth/register-incognito")}>
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
              <div className="flex items-center gap-2 cursor-pointer">
                <UserPlus className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors hover:cursor-pointer" />
                <span className="text-sm hidden md:block">Sign In</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-card shadow-lg rounded-md border border-border">
              <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => navigate("/auth/login")}>
                <LogOut className="mr-2 h-4 w-4 rotate-180" />
                <span>Sign In</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuItem className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => navigate("/auth/register")}>
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

  return (
    <>
      <header className="fixed top-0 z-40 w-full shadow-sm bg-background/90 backdrop-blur-md transition-colors duration-300">
        {/* Top announcement bar */}
        <div className="bg-foreground text-background py-2 px-4">
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
              <a href="https://www.instagram.com/rachanas_boutique?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61570600405333" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://wa.me/9944783389" className="hover:opacity-80 transition-colors" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp size={17} />
              </a>
            </div>
          </div>
        </div>
        {/* Main header */}
        <div className="bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <div className="lg:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs p-0 bg-background text-foreground">
                  <div className="p-6">
                    <Link to="/shop/home" className="block mb-6">
                      {/* <img src={logo} alt="Fashion Store Logo" className="h-8" /> */}
                    </Link>
                    <MenuItems onCloseSheet={() => setIsSheetOpen(false)} />
                    <div className="mt-8 pt-6 border-t border-border">
                      <HeaderRightContent />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <Link to="/shop/home" className="flex items-center">
              {/* <img src={logo} alt="Fashion Store Logo" className="h-8 md:h-12" /> */}
            </Link>
            <div className="hidden lg:block">
              <MenuItems onCloseSheet={() => {}} />
            </div>
            <div className="hidden lg:block">
              <HeaderRightContent />
            </div>
            <div className="flex items-center gap-3 lg:hidden">
              <button onClick={() => navigate('/shop/search')} className="relative group p-2">
                <Search className="h-5 w-5 text-foreground group-hover:opacity-80 transition-colors" />
                <span className="sr-only">Search</span>
              </button>
              <button
                className="relative group"
                onClick={(e) => {
                  if (cartIsLoading) return;
                  const now = Date.now();
                  if (now - lastCartSheetToggleTime.current > 300) {
                    lastCartSheetToggleTime.current = now;
                    setOpenCartSheet(true);
                  }
                }}
              >
                <ShoppingBag className="h-5 w-5 text-foreground group-hover:opacity-80 transition-colors" />
                {cartItems?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
                <span className="sr-only">Shopping Bag</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="h-[calc(4.9rem)]"></div>
    </>
  );
}

export default ShoppingHeader;