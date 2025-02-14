"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Home from "@/components/content/home";
import Form from "@/components/content/form";
import { FaHome, FaInfoCircle, FaEnvelope } from "react-icons/fa";

const Dashboard = () => {
  const [activeContent, setActiveContent] = useState("home");

  const menuItems = [
    { icon: FaHome, label: "Home", key: "home" },
    { icon: FaHome, label: "Form", key: "form" },
    { icon: FaInfoCircle, label: "About", key: "about" },
    { icon: FaEnvelope, label: "Contact", key: "contact" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="flex">
        <Sidebar
          activeContent={activeContent}
          setActiveContent={setActiveContent}
          menuItems={menuItems}
        />
        <main className="flex-1 p-4 mt-16 ml-64">
          {activeContent === "home" && <Home />}
          {activeContent === "form" && <Form className="w-full h-full" />}
          {/* Add other content components here based on activeContent */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
