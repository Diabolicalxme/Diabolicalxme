import {
  Layers,
  Film,
  BadgeCheck,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingBasket,
  MessageSquareDot,
  Users,
  Star,
  Contact,
  Mails
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import logo from "../../assets/logo.png";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    id: "banners",
    label: "Banners",
    path: "/admin/banners",
    icon: <Layers />,
  },
  {
    id: "categories",
    label: "Categories",
    path: "/admin/categories",
    icon: <ShoppingBasket />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBasket />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <BadgeCheck />,
  },
  {
    id: "instafeed",
    label: "Instafeed",
    path: "/admin/instafeed",
    icon: <Film />,
  },
  // {
  //   id: "reviews",
  //   label: "Reviews",
  //   path: "/admin/reviews",
  //   icon: <Star />,
  // },
  {
    id: "feedback",
    label: "Feedback",
    path: "/admin/feedback",
    icon: <MessageSquareDot />,
  },
  {
    id: "contact",
    label: "Contact",
    path: "/admin/contacts",
    icon: <Contact />,
  },
  {
    id: "newsletters",
    label: "News letters",
    path: "/admin/newsletters",
    icon: <Mails />,
  },
  {
    id: "users",
    label: "Users",
    path: "/admin/users",
    icon: <Users />,
  },
];

function MenuItems({ setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {adminSidebarMenuItems.map((menuItem) => {
        // Determine if this menu item is active by comparing location.pathname and menuItem.path
        const isActive = location.pathname === menuItem.path;
        const baseClasses = "flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2";
        const activeClasses = "bg-foreground text-white";
        const inactiveClasses = "text-muted-foreground hover:bg-gray-500 hover:text-white";
        return (
          <div
            key={menuItem.id}
            onClick={() => {
              navigate(menuItem.path);
              if (setOpen) setOpen(false);
            }}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          >
            {menuItem.icon}
            <span>{menuItem.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-5 mb-5">
                <ChartNoAxesCombined size={30} />
                <h1 className="text-2xl font-extrabold">Admin Panel</h1>
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center gap-2"
        >
          <ChartNoAxesCombined size={30} />
      <img src={logo} alt="Logo" className="w-full h-11" />
          
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;