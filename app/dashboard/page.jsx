"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Home from "@/components/content/home";
import Form from "@/components/content/form";
// import Report from "@/components/content/sample";
import Report from "@/components/content/Report";
import {
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaWpforms,
  FaChartBar,
  FaLayerGroup, // Add this import
} from "react-icons/fa";

const Dashboard = () => {
  // Check URL for content parameter
  const [activeContent, setActiveContent] = useState(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const contentParam = urlParams.get("content");
      return contentParam || "home";
    }
    return "home";
  });

  // Update URL when activeContent changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location);
      url.searchParams.set("content", activeContent);
      window.history.replaceState({}, "", url);
    }
  }, [activeContent]);

  const menuItems = [
    { icon: FaHome, label: "Home", key: "home" },
    { icon: FaWpforms, label: "Form", key: "form" },
    { icon: FaChartBar, label: "Report", key: "report" },
    // Removed Combined, About, Contact
  ];

  const renderContent = () => {
    switch (activeContent) {
      case "home":
        return <Home />;
      case "form":
        return <Form className="w-full" />;
      case "report":
        return <Report />;
      // Removed Combined, About, Contact
      default:
        return <Home />;
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <div className="flex flex-1">
        <Sidebar
          activeContent={activeContent}
          setActiveContent={setActiveContent}
          menuItems={menuItems}
        />
        <main className="flex-1 p-6 mt-16 ml-64 pb-10 bg-white">
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
