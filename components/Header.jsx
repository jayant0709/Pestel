import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-md fixed top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-800">
          PESTEL Analysis
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 text-gray-700">
          <NavLink href="/" label="Home" />
          <NavLink href="/about" label="About" />
          <NavLink href="/contact" label="Contact" />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="flex flex-col items-center py-4 space-y-4 text-gray-700">
            <NavLink href="/" label="Home" onClick={() => setIsOpen(false)} />
            <NavLink
              href="/about"
              label="About"
              onClick={() => setIsOpen(false)}
            />
            <NavLink
              href="/contact"
              label="Contact"
              onClick={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ href, label, onClick }) => (
  <Link
    href={href}
    className="hover:text-blue-600 transition-colors"
    onClick={onClick}
  >
    {label}
  </Link>
);

export default Header;
