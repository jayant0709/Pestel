"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Home from "@/components/content/home";
import Form from "@/components/content/form";
import Report from "@/components/content/sample";
import {
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaWpforms,
  FaChartBar,
} from "react-icons/fa";

const Dashboard = () => {
  const [activeContent, setActiveContent] = useState("home");

  const menuItems = [
    { icon: FaHome, label: "Home", key: "home" },
    { icon: FaWpforms, label: "Form", key: "form" },
    { icon: FaChartBar, label: "Report", key: "report" },
    { icon: FaInfoCircle, label: "About", key: "about" },
    { icon: FaEnvelope, label: "Contact", key: "contact" },
  ];

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
          <div className="max-w-6xl mx-auto">
            {activeContent === "home" && <Home />}
            {activeContent === "form" && <Form className="w-full" />}
            {activeContent === "report" && <Report />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
