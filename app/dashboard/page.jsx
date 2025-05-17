"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Home from "@/components/content/home";
import Form from "@/components/content/form";
// import Report from "@/components/content/sample";
import Report from "@/components/content/report";
import Combined from "@/components/content/Combined";
import {
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaWpforms,
  FaChartBar,
  FaLayerGroup, // Add this import
} from "react-icons/fa";

const Dashboard = () => {
  const [activeContent, setActiveContent] = useState("home");

  const menuItems = [
    { icon: FaHome, label: "Home", key: "home" },
    { icon: FaWpforms, label: "Form", key: "form" },
    { icon: FaChartBar, label: "Report", key: "report" },
    { icon: FaLayerGroup, label: "Combined", key: "combined" }, // Add this line
    { icon: FaInfoCircle, label: "About", key: "about" },
    { icon: FaEnvelope, label: "Contact", key: "contact" },
  ];

  const renderContent = () => {
    switch (activeContent) {
      case "home":
        return <Home />;
      case "form":
        return <Form className="w-full" />;
      case "report":
        return <Report />;
      case "combined":
        return <Combined />;
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
