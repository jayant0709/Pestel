"use client";

import React, { useState, createContext, useContext, useEffect } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext({
  value: undefined,
  onValueChange: () => {},
});

const Tabs = ({ defaultValue, value, onValueChange, children, className, ...props }) => {
  const [selectedTab, setSelectedTab] = useState(value || defaultValue);

  useEffect(() => {
    if (value !== undefined && value !== selectedTab) {
      setSelectedTab(value);
    }
  }, [value, selectedTab]);

  const handleValueChange = (newValue) => {
    setSelectedTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: selectedTab, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, className, ...props }) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
        "focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "hover:bg-gray-200 hover:text-gray-900",
        className
      )}
      onClick={() => onValueChange(value)}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className, ...props }) => {
  const { value: selectedValue } = useContext(TabsContext);
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      className={cn("mt-2 focus:outline-none", className)}
      data-state={isSelected ? "active" : "inactive"}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
