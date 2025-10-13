// src/hooks/useNavigationTabs.ts
import { useLocation } from "react-router-dom";

export const useNavigationTabs = (basePath: string, items: string[]) => {
  const location = useLocation();

  return items.map((item) => {
    const path = item.toLowerCase().replace(/\s+/g, "-");
    const href = `${basePath}/${path}`;

    return {
      name: item,
      href,
      current:
        location.pathname === href ||
        (location.pathname.startsWith(href) && href !== basePath),
    };
  });
};
