import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Moon, Sun1 } from "iconsax-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Fixes the issue of hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2 rounded-md">
      {theme === "dark" ? <Sun1 className="text-yellow-300" /> : <Moon className="text-yellow-300" />}
    </button>
  );
}
