import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Statistik from './pages/Statistik';
import UMKM from './pages/UMKM';
import UmkmDetail from './pages/UmkmDetail';
import Peta from './pages/Peta';
import Berita from './pages/Berita';
import BeritaDetail from './pages/BeritaDetail';
import Sarpras from './pages/Sarpras';
import SarprasDetail from './pages/SarprasDetail';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Warga from './pages/admin/Warga';
import UmkmAdmin from './pages/admin/UmkmAdmin';
import BeritaAdmin from './pages/admin/BeritaAdmin';
import SarprasAdmin from './pages/admin/SarprasAdmin';
import PetaAdmin from './pages/admin/PetaAdmin';
import PerangkatAdmin from './pages/admin/PerangkatAdmin';
import PengaturanAdmin from './pages/admin/PengaturanAdmin';
import LogAdmin from './pages/admin/LogAdmin';
import ManajemenAdmin from './pages/admin/ManajemenAdmin';
import { ToastProvider } from './components/ToastProvider';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 50,
    });
  }, []);

  return (
    <ToastProvider>
      <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 pb-12">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/statistik" element={<Statistik />} />
              <Route path="/umkm" element={<UMKM />} />
              <Route path="/umkm/:id" element={<UmkmDetail />} />
              <Route path="/sarpras" element={<Sarpras />} />
              <Route path="/sarpras/:id" element={<SarprasDetail />} />
              <Route path="/peta" element={<Peta />} />
              <Route path="/berita" element={<Berita />} />
              <Route path="/berita/:slug" element={<BeritaDetail />} />
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="warga" element={<Warga />} />
                <Route path="umkm" element={<UmkmAdmin />} />
                <Route path="berita" element={<BeritaAdmin />} />
                <Route path="sarpras" element={<SarprasAdmin />} />
                <Route path="peta" element={<PetaAdmin />} />
                <Route path="perangkat" element={<PerangkatAdmin />} />
                <Route path="profil-desa" element={<PengaturanAdmin />} />
                <Route path="log" element={<LogAdmin />} />
                <Route path="manajemen-admin" element={<ManajemenAdmin />} />
              </Route>
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
    </ToastProvider>
  );
}

export default App;
