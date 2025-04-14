import { useDispatch, useSelector } from "react-redux";
import { THEMES, setTheme } from "@/store/theme-slice";
import { Moon, Sun, Palette, Droplet, Circle } from "lucide-react";
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
          {currentTheme === THEMES.BOTTLE_GREEN && (
            <Droplet className="h-5 w-5 text-green-900 group-hover:text-green-700 transition-colors" />
          )}
          {currentTheme === THEMES.BEIGE && (
            <Palette className="h-5 w-5 text-amber-200 group-hover:text-amber-300 transition-colors" />
          )}
          {currentTheme === THEMES.BLACK && (
            <Circle className="h-5 w-5 text-gray-900 group-hover:text-gray-700 transition-colors" />
          )}
          {(currentTheme === THEMES.EMERALD || currentTheme === THEMES.WINE) && (
            <Palette className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
          )}
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 p-2 bg-card shadow-lg rounded-md border border-input">
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-muted/30 cursor-pointer",
            currentTheme === THEMES.LIGHT && "bg-muted/20"
          )}
          onClick={() => handleThemeChange(THEMES.LIGHT)}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>

        {/* New Themes */}
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            currentTheme === THEMES.BOTTLE_GREEN && "bg-gray-100 dark:bg-gray-800"
          )}
          onClick={() => handleThemeChange(THEMES.BOTTLE_GREEN)}
        >
          <Droplet className="mr-2 h-4 w-4 text-green-900" />
          <span>Bottle Green (Hector)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            currentTheme === THEMES.BEIGE && "bg-gray-100 dark:bg-gray-800"
          )}
          onClick={() => handleThemeChange(THEMES.BEIGE)}
        >
          <div className="mr-2 h-4 w-4 rounded-full bg-amber-200" />
          <span>Beige (Author)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            currentTheme === THEMES.BLACK && "bg-gray-100 dark:bg-gray-800"
          )}
          onClick={() => handleThemeChange(THEMES.BLACK)}
        >
          <Circle className="mr-2 h-4 w-4 text-gray-900" />
          <span>Black (Bravo)</span>
        </DropdownMenuItem>

        {/* Legacy Themes */}
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            currentTheme === THEMES.DARK && "bg-gray-100 dark:bg-gray-800"
          )}
          onClick={() => handleThemeChange(THEMES.DARK)}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark (Legacy)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            currentTheme === THEMES.EMERALD && "bg-gray-100 dark:bg-gray-800"
          )}
          onClick={() => handleThemeChange(THEMES.EMERALD)}
        >
          <div className="mr-2 h-4 w-4 rounded-full bg-emerald-600" />
          <span>Emerald (Legacy)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "flex items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            currentTheme === THEMES.WINE && "bg-gray-100 dark:bg-gray-800"
          )}
          onClick={() => handleThemeChange(THEMES.WINE)}
        >
          <div className="mr-2 h-4 w-4 rounded-full bg-red-800" />
          <span>Wine (Legacy)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeToggle;