# 🏛️ Sistem Informasi Desa Beji (Kadus 2)

![Website Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Sistem Informasi Desa Beji (Kadus 2) adalah platform digital modern yang dirancang untuk mendigitalisasi administrasi desa, memberikan transparansi data kependudukan, mempublikasikan berita/kegiatan warga, serta menjadi wadah katalog digital untuk memberdayakan UMKM lokal.

Aplikasi ini dikembangkan dengan arsitektur **MERN/PERN Stack** (React, Express, Node.js, MySQL) dan dioptimalkan dengan antarmuka yang ramah pengguna, responsif, dan elegan.

---

## ✨ Fitur Utama

- **📊 Statistik Kependudukan Interaktif:** Visualisasi data warga (jumlah jiwa, gender, agama, tingkat pendidikan, pekerjaan, umur) yang transparan dan selalu terbarui.
- **📰 Portal Berita Desa:** Publikasi berita, pengumuman, dan agenda desa dengan fitur editor teks (*Rich Text Editor*) untuk admin.
- **🛍️ Katalog UMKM Lokal:** Etalase digital untuk produk warga, lengkap dengan galeri foto, deskripsi, lokasi Google Maps, dan tombol *direct-message* ke WhatsApp pemilik usaha.
- **🗺️ Peta Interaktif & Infrastruktur:** Peta batas dusun dan titik-titik infrastruktur penting.
- **👨‍💼 Profil Aparatur Desa:** Struktur organisasi pemerintahan desa yang informatif.
- **🔒 Dashboard Admin Terpusat:** Sistem *Content Management System* (CMS) berbasis *role* yang dilindungi JWT (*JSON Web Token*) untuk mengelola seluruh data dari satu pintu.
- **🛡️ Keamanan Lapis Ganda:** Dilengkapi proteksi dari injeksi SQL, XSS (*Cross-Site Scripting*), dan *Brute-Force attacks*.
- **☁️ Cloud Image Hosting:** Seluruh aset gambar (Berita, UMKM, Profil) diunggah dan dioptimasi secara otomatis menggunakan *Cloudinary*.

---

## 🛠️ Teknologi yang Digunakan

### Frontend (Client-Side)
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS + Vanilla CSS (UI/UX Premium)
- **Routing:** React Router v6
- **Animations:** AOS (Animate on Scroll)
- **Icons:** Lucide React
- **HTTP Client:** Fetch API native

### Backend (Server-Side)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 2 (via `mysql2/promise`)
- **Authentication:** JSON Web Token (JWT) & bcrypt
- **Security:** Helmet & Express Rate Limit
- **Media Processing:** Multer, Sharp (Image Resizer), & Cloudinary API

---

## 🚀 Cara Menjalankan di Komputer Lokal (Development)

### Persyaratan Sistem
Pastikan perangkat Anda telah menginstal:
- [Node.js](https://nodejs.org/) (Versi 18+ direkomendasikan)
- [MySQL Server](https://dev.mysql.com/downloads/) (XAMPP / Laragon / Standalone)
- Akun [Cloudinary](https://cloudinary.com/) (Untuk penyimpanan gambar)

### Langkah-langkah Instalasi

**1. Clone Repositori**
```bash
git clone https://github.com/USERNAME/web-desa-beji.git
cd web-desa-beji
```

**2. Setup Database**
- Buka aplikasi pengelola MySQL (phpMyAdmin / DBeaver).
- Buat database baru bernama `web_desa`.
- *Import* file `backend/schema.sql` untuk membuat struktur tabel.

**3. Konfigurasi Backend**
- Buka terminal baru dan arahkan ke folder `backend`:
  ```bash
  cd backend
  npm install
  ```
- Salin file `.env.example` (atau buat file `.env` baru di dalam folder backend) dan isi variabel berikut:
  ```env
  PORT=8000
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=web_desa
  JWT_SECRET=super_secret_key_yang_panjang_dan_acak
  CLOUDINARY_CLOUD_NAME=nama_cloud_anda
  CLOUDINARY_API_KEY=api_key_anda
  CLOUDINARY_API_SECRET=api_secret_anda
  ```
- Jalankan server backend:
  ```bash
  npm start
  ```

**4. Konfigurasi Frontend**
- Buka terminal baru dan arahkan ke folder `frontend`:
  ```bash
  cd frontend
  npm install
  ```
- Buat file `.env` di dalam folder frontend dan atur URL backend:
  ```env
  VITE_API_BASE_URL=http://localhost:8000/api
  ```
- Jalankan server development React:
  ```bash
  npm run dev
  ```
- Akses website di: `http://localhost:5173`

*(Catatan: Username default admin biasanya `admin` dengan password `password123` jika database sudah di-seed, atau buat manual via tabel admin).*

---

## 🌍 Cara Deployment (Production)

Proyek ini sudah dirancang untuk *deployment* terpisah (*Decoupled Architecture*) dengan layanan Cloud modern:

1. **Frontend:** Direkomendasikan untuk di-deploy ke **[Vercel](https://vercel.com/)** secara gratis. Cukup integrasikan repository GitHub ini, arahkan Root Directory ke `frontend`, dan masukkan variabel `VITE_API_BASE_URL`.
2. **Backend:** Direkomendasikan untuk di-deploy ke **[Render.com](https://render.com/)** (Web Service). Arahkan Root Directory ke `backend`, masukkan perintah `npm install` dan `npm start`, lalu lengkapi variabel `.env` nya.
3. **Database:** Gunakan layanan DBaaS (Database-as-a-Service) terpisah seperti **[Aiven.io](https://aiven.io/)** (Gratis 5GB) atau Google Cloud SQL.

---

## 📁 Struktur Direktori

```text
web-desa-beji/
├── backend/                  # Server Node.js Express
│   ├── controllers/          # Logika bisnis (Berita, UMKM, Warga, dll)
│   ├── middleware/           # Proteksi Auth & penanganan upload Multer
│   ├── routes/               # Endpoint REST API
│   ├── db.js                 # Koneksi Pool MySQL
│   ├── server.js             # Entry point backend utama
│   └── package.json          # Daftar dependensi backend
├── frontend/                 # Aplikasi Klien React Vite
│   ├── src/
│   │   ├── components/       # Komponen UI (Navbar, Modal, Statistik)
│   │   ├── pages/            # Halaman utama (Home, Berita, Admin Panel)
│   │   ├── App.jsx           # Routing Utama React
│   │   └── index.css         # Styling global Tailwind
│   ├── index.html
│   └── package.json          # Daftar dependensi frontend
└── README.md                 # Dokumentasi Proyek
```

---

## 📄 Kredit & Lisensi

Proyek Sistem Informasi Desa ini dikembangkan dan diserahkan secara eksklusif untuk kebutuhan administrasi **Dusun Beji Kadus 2**.

Dikembangkan oleh:
**Kelompok KKN AD 84 375 dan Randra Ferdian Saputra**

---
