import { useState, useEffect, useCallback } from "react";

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save to state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      // Remove from state
      setStoredValue(initialValue);

      // Remove from local storage
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  // Listen to changes to this localStorage key made from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== e.oldValue) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, initialValue]);

  // Sync initial value on mount
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue, removeValue];
};

// Specialized localStorage hooks
export const useLocalStorageState = <T>(key: string, initialValue: T) => {
  return useLocalStorage(key, initialValue);
};

export const useLocalStorageObject = <T extends object>(
  key: string,
  initialValue: T,
) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

  const updateValue = useCallback(
    (updates: Partial<T>) => {
      setValue((prev) => ({ ...prev, ...updates }));
    },
    [setValue],
  );

  return [value, updateValue, removeValue] as const;
};

export const useLocalStorageArray = <T>(
  key: string,
  initialValue: T[] = [],
) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

  const addItem = useCallback(
    (item: T) => {
      setValue((prev) => [...prev, item]);
    },
    [setValue],
  );

  const removeItem = useCallback(
    (index: number) => {
      setValue((prev) => prev.filter((_, i) => i !== index));
    },
    [setValue],
  );

  const updateItem = useCallback(
    (index: number, item: T) => {
      setValue((prev) =>
        prev.map((oldItem, i) => (i === index ? item : oldItem)),
      );
    },
    [setValue],
  );

  const clear = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return {
    value,
    setValue,
    addItem,
    removeItem,
    updateItem,
    clear,
    removeValue,
  };
};

// Hook for storing and managing user preferences
export const usePreferences = () => {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
  const [language, setLanguage] = useLocalStorage<string>("language", "id");
  const [pageSize, setPageSize] = useLocalStorage<number>("pageSize", 10);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>(
    "sidebarCollapsed",
    false,
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, [setTheme]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, [setSidebarCollapsed]);

  return {
    theme,
    language,
    pageSize,
    sidebarCollapsed,
    setTheme,
    setLanguage,
    setPageSize,
    setSidebarCollapsed,
    toggleTheme,
    toggleSidebar,
  };
};
