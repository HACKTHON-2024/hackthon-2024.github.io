import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-white bg-opacity-95 backdrop-blur-md shadow-md fixed top-0 z-50 border-b-2 border-green-700 w-full">
            <div className="mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo Section */}
                <div className="flex items-center gap-2">
                    <img src="logo.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-green-700 shadow-md" />
                    <div className="flex flex-col">
                        <span className="font-serif text-2xl font-bold text-green-700">LabourField</span>
                        <span className="text-sm text-gray-600 italic">Connecting Farms &amp; Labor</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-8">
                    <NavLink to="/" icon="fas fa-home" label="Home" />
                    <NavLink to="/about" icon="fas fa-info-circle" label="About Us" />
                    <NavLink to="/services" icon="fas fa-tractor" label="Services" />
                    <NavLink to="/support" icon="fas fa-headset" label="Help &amp; Support" />
                </nav>

                {/* Mobile Menu Button */}
                <button onClick={toggleMenu} className="md:hidden p-2 text-gray-800 hover:text-green-700">
                    <i className="fas fa-bars text-xl"></i>
                </button>
            </div>

            {/* Mobile Sidebar Navigation (Opens from the Right) */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
                    isMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Close Button */}
                <button onClick={toggleMenu} className="absolute top-4 left-4 text-gray-800 hover:text-green-700">
                    <i className="fas fa-times text-xl"></i>
                </button>

                {/* Menu Items */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <ul className="flex flex-col gap-6">
                        <NavLink to="/" icon="fas fa-home" label="Home" isMobile />
                        <NavLink to="/about" icon="fas fa-info-circle" label="About Us" isMobile />
                        <NavLink to="/services" icon="fas fa-tractor" label="Services" isMobile />
                        <NavLink to="/support" icon="fas fa-headset" label="Help &amp; Support" isMobile />
                    </ul>
                </div>
            </div>

            {/* Overlay (Does NOT hide the header) */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-opacity-50 z-40 md:hidden" onClick={toggleMenu}></div>
            )}
        </header>
    );
};

const NavLink = ({ to, icon, label, isMobile = false }) => (
    <li className={isMobile ? "px-4 py-2 rounded-md hover:bg-gray-100" : "list-none"}>
        <Link to={to} className="flex items-center text-gray-800 hover:text-green-700 transition-all duration-300">
            <i className={`${icon} text-lg`} />
            <span className="text-sm font-medium ml-2">{label}</span>
        </Link>
    </li>
);

export default Header;
