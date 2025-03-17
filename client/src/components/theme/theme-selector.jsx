import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { THEMES, setTheme } from '@/store/theme-slice';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function ThemeSelector() {
  const dispatch = useDispatch();
  const { currentTheme } = useSelector((state) => state.theme);

  const handleThemeChange = (theme) => {
    dispatch(setTheme(theme));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          {currentTheme === THEMES.DARK ? (
            <Moon className="h-5 w-5" />
          ) : currentTheme === THEMES.EMERALD ? (
            <Palette className="h-5 w-5 text-emerald-600" />
          ) : currentTheme === THEMES.WINE ? (
            <Palette className="h-5 w-5 text-red-700" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange(THEMES.LIGHT)}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange(THEMES.DARK)}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange(THEMES.EMERALD)}>
          <Palette className="mr-2 h-4 w-4 text-emerald-600" />
          <span>Emerald</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange(THEMES.WINE)}>
          <Palette className="mr-2 h-4 w-4 text-red-700" />
          <span>Wine</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeSelector;