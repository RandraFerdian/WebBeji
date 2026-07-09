import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blue-950 text-blue-100 py-12 mt-auto border-t border-blue-900">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-3">
              <img src="/logoBeji.svg" alt="Logo Beji" className="w-9 h-9 opacity-90 brightness-0 invert" />
              <span className="text-2xl font-bold text-white tracking-tight">Dukuh Beji</span>
            </div>
            <p className="text-sm text-blue-200/80 text-center md:text-left max-w-sm leading-relaxed">
              Platform layanan informasi digital terpadu untuk warga Dukuh Beji Kadus 2, Kalitengah, Wedi, Klaten.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end text-sm bg-blue-900/40 p-5 rounded-2xl border border-blue-800/50 backdrop-blur-sm">
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center gap-3">
                <img src="/logo_kkn.svg" alt="Logo KKN" className="w-8 h-8 object-contain" />
                <span className="text-lg font-bold text-white">
                  Tim KKN UPNYK AD84.375
                </span>
              </div>
              <span className="text-blue-300 flex items-center gap-1.5 text-[13px]">
                <span>&amp;</span>
                <a href="https://github.com/RandraFerdian" target="_blank" rel="noreferrer" className="font-semibold text-blue-100 hover:text-white transition-colors">
                  Randra Ferdian Saputra
                </a>
              </span>
            </div>
          </div>
          
        </div>
        
        <div className="border-t border-blue-900 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-blue-300/70 gap-4">
          <p>&copy; {new Date().getFullYear()} Dukuh Beji. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-blue-100 transition-colors cursor-pointer">Syarat & Ketentuan</span>
            <span className="hover:text-blue-100 transition-colors cursor-pointer">Kebijakan Privasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
