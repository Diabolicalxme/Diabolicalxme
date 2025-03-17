import { useDispatch, useSelector } from "react-redux";
import { THEMES, setTheme } from "@/store/theme-slice";
import { Moon, Sun, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

function ThemeToggle({ className }) {
  const dispatch = useDispatch();
  const { currentTheme } = useSelector((state) => state.theme);

  const handleThemeChange = (theme) => {
    dispatch(setTheme(theme));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative group p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            className
          )}
          aria-label="Toggle theme"
        >
          {currentTheme === THEMES.LIGHT && (
            <Sun className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
          )}
          {currentTheme === THEMES.DARK && (
            <Moon className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
          )}
          {(currentTheme === THEMES.EMERALD || currentTheme === THEMES.WINE) && (
            <Palette className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
          )}
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 p-2 bg-white shadow-lg rounded-md border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            currentTheme === THEMES.LIGHT && "bg-gray-100 dark:bg-gray-800"
          )}
          onClick={() => handleThemeChange(THEMES.LIGHT)}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            currentTheme === THEMES.DARK && "bg-gray-100 dark:bg-gray-800"
          )}
          onClick={() => handleThemeChange(THEMES.DARK)}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            currentTheme === THEMES.EMERALD && "bg-gray-100 dark:bg-gray-800"
          )}
          onClick={() => handleThemeChange(THEMES.EMERALD)}
        >
          <div className="mr-2 h-4 w-4 rounded-full bg-emerald-600" />
          <span>Emerald</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            currentTheme === THEMES.WINE && "bg-gray-100 dark:bg-gray-800"
          )}
          onClick={() => handleThemeChange(THEMES.WINE)}
        >
          <div className="mr-2 h-4 w-4 rounded-full bg-red-800" />
          <span>Wine</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeToggle;