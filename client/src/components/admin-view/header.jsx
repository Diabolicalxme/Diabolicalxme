import { AlignJustify, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import { THEMES, setTheme } from "@/store/theme-slice";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();
  const { currentTheme } = useSelector((state) => state.theme);

  function handleLogout() {
    dispatch(logoutUser());
  }

  function toggleAdminTheme() {
    if (currentTheme === THEMES.ADMIN_LIGHT) {
      dispatch(setTheme(THEMES.ADMIN_DARK));
    } else {
      dispatch(setTheme(THEMES.ADMIN_LIGHT));
    }
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      <Button onClick={() => setOpen(true)} className="lg:hidden sm:block">
        <AlignJustify />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex flex-1 justify-end gap-2">
        <Button
          onClick={toggleAdminTheme}
          variant="ghost"
          size="icon"
          className="rounded-full bg-accent/10 hover:bg-accent/20"
        >
          {currentTheme === THEMES.ADMIN_DARK ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle admin theme</span>
        </Button>
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow"
        >
          <LogOut />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
