import {
  LogOut,
  Menu,
  ShoppingBag,
  UserCog,
  Search,
  ChevronDown,
  UserPlus,
  Users,
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { fetchIncognitoUsers, loginAsIncognitoUser, logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useState, useRef, useEffect, memo } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import ThemeToggle from "../theme/theme-toggle";
import TopBar from "./topbar";

// Memoized MenuItems component to prevent unnecessary re-renders
const MenuItems = memo(({ onCloseSheet }) => {
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
        ? {
          category: [getCurrentMenuItem.id],
        }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("collections") && currentFilter !== null
      ? setSearchParams(
        new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
      )
      : navigate(getCurrentMenuItem.path);

    onCloseSheet(); // Close the sheet when a menu item is clicked
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <div className="relative group" key={menuItem.id}>
          <Label
            onClick={() => handleNavigate(menuItem)}
            className="text-base uppercase tracking-wider font-medium cursor-pointer flex items-center"
          >
            {menuItem.label}
            {menuItem.hasSubmenu && <ChevronDown className="ml-1 h-4 w-4" />}
          </Label>
          {/* Underline effect */}
          <span className="hidden md:block absolute left-0 bottom-[-4px] w-0 h-[2px] bg-foreground transition-all duration-300 group-hover:w-full"></span>
        </div>
      ))}
    </nav>
  );
});

// Memoized HeaderRightContent component to prevent unnecessary re-renders
const HeaderRightContent = memo(({ setIsSheetOpen, cartItems, openCartSheet, setOpenCartSheet }) => {
  const { user, incognitoUsers } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const fetchedIncognitoRef = useRef(false);

  // Fetch incognito users only once when the component mounts
  useEffect(() => {
    if (user && !user.isIncognito && !fetchedIncognitoRef.current) {
      fetchedIncognitoRef.current = true;
      dispatch(fetchIncognitoUsers());
    }
  }, [dispatch, user?.id]);

  function handleLogout() {
    dispatch(logoutUser())
      .unwrap()
      .then((result) => {
        if (result.success) {
          toast({
            title: "Logged out successfully",
          });
        }
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        toast({
          title: "Logout failed",
          description: "Please try again.",
          variant: "destructive",
        });
      });
  }

  function handleSwitchToIncognitoUser(incognitoUserId) {
    dispatch(loginAsIncognitoUser(incognitoUserId))
      .unwrap()
      .then((result) => {
        if (result.success) {
          toast({
            title: `Switched to ${result.user.userName}'s account`,
          });
          setIsSheetOpen(false);
        }
      })
      .catch((error) => {
        console.error("Switch failed:", error);
        toast({
          title: "Failed to switch accounts",
          description: "Please try again.",
          variant: "destructive",
        });
      });
  }

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Search icon */}
        <button
          onClick={() => navigate('/shop/search')}
          className="relative group"
        >
          <Search className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors" />
          <span className="sr-only">Search</span>
        </button>

        {/* Cart icon */}
        <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
          <SheetTrigger asChild>
            <button
              className="relative group flex items-center"
            >
              <ShoppingBag className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors" />
              {cartItems?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
              <span className="sr-only">Shopping Bag</span>
            </button>
          </SheetTrigger>
          <UserCartWrapper
            setOpenCartSheet={setOpenCartSheet}
            onMenuClose={() => setIsSheetOpen(false)}
            cartItems={cartItems || []}
          />
        </Sheet>
      </div>

      {/* User account */}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="h-8 w-8 bg-card border border-border">
                <AvatarFallback className="bg-card text-foreground font-medium text-sm">
                  {user?.userName && user.userName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm hidden md:block">
                {user.isIncognito ? `${user.userName} (Friend)` : "My Account"}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 bg-card shadow-lg rounded-md border border-border">
            <DropdownMenuLabel className="text-sm text-muted-foreground">
              Hello, {user.userName}
              {user.isIncognito && <span className="ml-1 text-xs">(Friend)</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border my-1" />
            
            <DropdownMenuItem
              className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
              onClick={() => {
                navigate("/shop/account");
                setIsSheetOpen(false);
              }}
            >
              <UserCog className="mr-2 h-4 w-4" />
              <span>My Account</span>
            </DropdownMenuItem>
            
            {/* Only show Register Friend and Switch Account options for main user */}
            {!user.isIncognito && (
              <>
                <DropdownMenuItem
                  className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
                  onClick={() => {
                    navigate("/auth/register-incognito");
                    setIsSheetOpen(false);
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Register a Friend</span>
                </DropdownMenuItem>
                
                {incognitoUsers && incognitoUsers.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Switch Account</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-48 p-2 bg-card shadow-lg rounded-md border border-border">
                        {incognitoUsers.map((incognitoUser) => (
                          <DropdownMenuItem
                            key={incognitoUser._id}
                            className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
                            onClick={() => handleSwitchToIncognitoUser(incognitoUser._id)}
                          >
                            <Avatar className="h-6 w-6 mr-2 bg-card border border-border">
                              <AvatarFallback className="bg-card text-foreground font-medium text-xs">
                                {incognitoUser.userName[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{incognitoUser.userName}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}
              </>
            )}
            
            <DropdownMenuSeparator className="bg-border my-1" />
            <DropdownMenuItem
              className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <UserPlus className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors hover:cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 bg-card shadow-lg rounded-md border border-border"
          >
            <DropdownMenuItem
              className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
              onClick={() => navigate("/auth/login")}
            >
              Sign In
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border my-1" />
            <DropdownMenuItem
              className="flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer"
              onClick={() => navigate("/auth/register")}
            >
              Create Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
});

// Main ShoppingHeader component
function ShoppingHeader() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Using a ref to track if cart items have been fetched
  const hasInitiallyFetchedCart = useRef(false);

  // Fetch cart items only once when the component mounts
  useEffect(() => {
    if (user?.id && !hasInitiallyFetchedCart.current) {
      hasInitiallyFetchedCart.current = true;
      dispatch(fetchCartItems(user.id));
    }
  }, [user?.id, dispatch]);

  return (
    <>
      <header className="fixed top-0 z-40 w-full bg-card shadow-sm">
        {/* Top announcement bar */}
        <TopBar />

        {/* Main header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-full max-w-xs p-0">
                  <div className="p-6">
                    <Link to="/shop/home" className="block mb-6">
                      {/* <img src={logo} alt="Fashion Store Logo" className="h-8" /> */}
                    </Link>
                    <MenuItems onCloseSheet={() => setIsSheetOpen(false)} />
                    <div className="mt-8 pt-6 border-t">
                      <HeaderRightContent 
                        setIsSheetOpen={setIsSheetOpen}
                        cartItems={cartItems}
                        openCartSheet={openCartSheet}
                        setOpenCartSheet={setOpenCartSheet}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <Link to="/shop/home" className="flex items-center h-10 w-64">
              {/* <img src={logo} alt="Fashion Store Logo" className="h-8 md:h-10" /> */}
            </Link> 

            {/* Desktop navigation */}
            <div className="hidden lg:block">
              <MenuItems onCloseSheet={() => {}} />
            </div>

            {/* Right side icons */}
            <div className="hidden lg:block">
              <HeaderRightContent 
                setIsSheetOpen={setIsSheetOpen}
                cartItems={cartItems}
                openCartSheet={openCartSheet}
                setOpenCartSheet={setOpenCartSheet}
              />
            </div>

            {/* Mobile right icons */}
            <div className="flex items-center gap-3 lg:hidden">
              <ThemeToggle />
              <button
                onClick={() => navigate('/shop/search')}
                className="relative group p-2"
              >
                <Search className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors" />
                <span className="sr-only">Search</span>
              </button>
              <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
                <SheetTrigger asChild>
                  <button className="relative group">
                    <ShoppingBag className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors" />
                    {cartItems?.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-black text-white dark:bg-white dark:text-black text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                    <span className="sr-only">Shopping Bag</span>
                  </button>
                </SheetTrigger>
                <UserCartWrapper
                  setOpenCartSheet={setOpenCartSheet}
                  onMenuClose={() => setIsSheetOpen(false)}
                  cartItems={cartItems || []}
                />
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <div className="h-[120px]"></div> {/* Spacer to prevent content from being hidden under the fixed header */}
    </>
  );
}

export default ShoppingHeader;