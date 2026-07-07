import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Statistik', path: '/statistik' },
    { name: 'Peta', path: '/peta' },
    { name: 'UMKM', path: '/umkm' },
    { name: 'Sarpras', path: '/sarpras' },
    { name: 'Berita', path: '/berita' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-nav">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <img src="/logoBeji.svg" alt="Logo Dukuh Beji" className="w-8 h-8" />
            <span>Beji<span className="text-primary">Kadus2</span></span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[15px] font-medium transition-colors ${
                isActive(link.path) ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/admin" className="btn-primary ml-4 px-6 flex items-center justify-center">
            Login Admin
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-4 shadow-lg absolute w-full left-0 top-[64px]">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block text-[16px] font-medium ${
                isActive(link.path) ? 'text-primary' : 'text-gray-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/admin" onClick={() => setIsOpen(false)} className="btn-primary w-full flex items-center justify-center mt-4">
            Login Admin
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
