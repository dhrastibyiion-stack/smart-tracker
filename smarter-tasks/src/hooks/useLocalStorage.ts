import React, { useEffect, useState } from "react";

const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  // Check if localStorage is available
  if (typeof window === 'undefined' || !(window as unknown as { localStorage?: Storage }).localStorage) {
    return defaultValue;
  }

  try {
    const savedItem = window.localStorage.getItem(key);
    if (savedItem) {
      return JSON.parse(savedItem) as T;
    }
  } catch (e) {
    console.error(`Error reading localStorage item "${key}":`, e);
  }
  return defaultValue;
};

export const useLocalStorage = <T,>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    return getStoredValue<T>(key, defaultValue);
  });

  useEffect(() => {
    // Check if localStorage is available
    if (
      typeof window === "undefined" ||
      !(window as unknown as { localStorage?: Storage }).localStorage
    ) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error setting localStorage item "${key}":`, e);
    }
  }, [key, value]);

  return [value, setValue];
};

