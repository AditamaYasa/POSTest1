"use client";

import { useEffect } from "react";

export default function ThemeScript() {
  useEffect(() => {
    const getThemePreference = () => {
      if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
        return localStorage.getItem("theme")!;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    const theme = getThemePreference();
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, []);

  return null;
}
