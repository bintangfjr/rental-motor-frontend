import { useState, useEffect } from "react";
// Basic debounce hook
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};
// Advanced debounce hook with callback
export const useDebouncedCallback = (callback, delay, dependencies = []) => {
    const [timeoutId, setTimeoutId] = useState(null);
    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId, ...dependencies]);
    const debouncedCallback = (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        const newTimeoutId = setTimeout(() => {
            callback(...args);
        }, delay);
        setTimeoutId(newTimeoutId);
    };
    return debouncedCallback;
};
// Debounce hook for search functionality
export const useDebouncedSearch = (initialValue = "", delay = 300) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const debouncedSearchTerm = useDebounce(searchTerm, delay);
    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };
    const clearSearch = () => {
        setSearchTerm("");
    };
    return {
        searchTerm,
        debouncedSearchTerm,
        handleSearchChange,
        clearSearch,
    };
};
// Debounce hook for form fields
export const useDebouncedField = (initialValue, delay = 500) => {
    const [value, setValue] = useState(initialValue);
    const debouncedValue = useDebounce(value, delay);
    const handleChange = (newValue) => {
        setValue(newValue);
    };
    return {
        value,
        debouncedValue,
        handleChange,
    };
};
