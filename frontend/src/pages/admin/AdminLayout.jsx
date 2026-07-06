import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, FileText, Map as MapIcon, LogOut, Menu, X, Activity } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Basic Auth Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Data Warga', path: '/admin/warga', icon: <Users size={20} /> },
    { name: 'Data UMKM', path: '/admin/umkm', icon: <ShoppingBag size={20} /> },
    { name: 'Profil Desa', path: '/admin/profil-desa', icon: <FileText size={20} /> },
    { name: 'Berita', path: '/admin/berita', icon: <FileText size={20} /> },
    { name: 'Peta', path: '/admin/peta', icon: <MapIcon size={20} /> },
    { name: 'Perangkat Desa', path: '/admin/perangkat', icon: <Users size={20} /> },
    { name: 'Log Aktivitas', path: '/admin/log', icon: <Activity size={20} /> },
    { name: 'Manajemen Admin', path: '/admin/manajemen-admin', icon: <Users size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 fixed inset-0 z-50">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 z-50">
        <Link to="/" className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <img src="/logoBeji.svg" alt="Logo Dukuh Beji" className="w-8 h-8" />
          <span>Beji<span className="text-primary">Admin</span></span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 mt-[60px] md:mt-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="hidden md:block p-6 border-b border-gray-100">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <img src="/logoBeji.svg" alt="Logo Dukuh Beji" className="w-8 h-8" />
            <span>Beji<span className="text-primary">Admin</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-white">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50/50 p-4 md:p-8 mt-[60px] md:mt-0">
        <div className="max-w-7xl mx-auto pb-24 md:pb-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
