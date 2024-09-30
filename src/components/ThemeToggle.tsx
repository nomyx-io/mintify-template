import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Image from "next/image";
import moonIcon from "@/assets/icons/weather/moonIcon.svg";
import sunIcon from "@/assets/icons/weather/sunIcon.svg";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Fixes the issue of hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2 rounded-md">
      {theme === "dark" ? (
        <Image src={sunIcon} alt="Light mode" width={24} height={24} />
      ) : (
        <Image src={moonIcon} alt="Dark mode" width={24} height={24} />
      )}
    </button>
  );
}
