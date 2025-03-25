import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FaChartPie, FaUser } from "react-icons/fa";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 z-50 border-b border-gray-100">
      <nav className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold flex items-center gap-2 text-gray-800 hover:text-gray-900 transition-colors">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <FaChartPie className="text-white text-xl" />
          </div>
          <span className="tracking-tight">PESTEL ANALYSIS</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-6">
            <NavLink href="/" label="Home" />
            <NavLink href="/about" label="About" />
            <NavLink href="/contact" label="Contact" />
          </div>
          <div className="pl-6 border-l border-gray-200">
            <div className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer hover:shadow-md">
              <FaUser className="text-gray-700 hover:text-blue-600 transition-colors text-lg" />
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full">
          <div className="flex flex-col py-2 space-y-1">
            <MobileNavLink href="/" label="Home" onClick={() => setIsOpen(false)} />
            <MobileNavLink href="/about" label="About" onClick={() => setIsOpen(false)} />
            <MobileNavLink href="/contact" label="Contact" onClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ href, label, onClick }) => (
  <Link
    href={href}
    className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm"
    onClick={onClick}
  >
    {label}
  </Link>
);

const MobileNavLink = ({ href, label, onClick }) => (
  <Link
    href={href}
    className="px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors text-sm font-medium"
    onClick={onClick}
  >
    {label}
  </Link>
);

export default Header;
