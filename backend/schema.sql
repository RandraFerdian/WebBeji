CREATE DATABASE IF NOT EXISTS desa_beji;
USE desa_beji;

CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS kategori_pendidikan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS kategori_pekerjaan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS warga (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(16) NOT NULL UNIQUE,
    no_kk VARCHAR(16) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    jenis_kelamin CHAR(1) NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
    tempat_lahir VARCHAR(50) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    agama VARCHAR(20) NOT NULL,
    pendidikan_id INT,
    pekerjaan_id INT,
    golongan_darah VARCHAR(2),
    status_perkawinan VARCHAR(20) NOT NULL,
    status_hubungan_keluarga VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pendidikan_id) REFERENCES kategori_pendidikan(id),
    FOREIGN KEY (pekerjaan_id) REFERENCES kategori_pekerjaan(id)
);

CREATE TABLE IF NOT EXISTS umkm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pemilik_id INT,
    nama_usaha VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    nomor_wa VARCHAR(20) NOT NULL,
    titik_gmaps VARCHAR(255),
    status VARCHAR(10) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pemilik_id) REFERENCES warga(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS foto_umkm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    umkm_id INT,
    url VARCHAR(255) NOT NULL,
    caption VARCHAR(100),
    urutan SMALLINT DEFAULT 1,
    FOREIGN KEY (umkm_id) REFERENCES umkm(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS berita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    judul VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    konten TEXT NOT NULL,
    thumbnail_url VARCHAR(255),
    status VARCHAR(10) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(id)
);

CREATE TABLE IF NOT EXISTS peta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('batas_wilayah', 'infrastruktur', 'umkm')),
    geojson TEXT NOT NULL,
    deskripsi VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS log_aktivitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    aksi VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(id)
);

-- Indexes
CREATE INDEX idx_warga_nik ON warga(nik);
CREATE INDEX idx_warga_no_kk ON warga(no_kk);
CREATE INDEX idx_berita_slug ON berita(slug);
CREATE INDEX idx_berita_status ON berita(status);
CREATE INDEX idx_umkm_status ON umkm(status);
CREATE INDEX idx_log_admin_id ON log_aktivitas(admin_id);

CREATE TABLE IF NOT EXISTS sarpras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    deskripsi_singkat VARCHAR(255) NOT NULL,
    deskripsi_detail TEXT NOT NULL,
    cover_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS foto_sarpras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sarpras_id INT,
    url VARCHAR(255) NOT NULL,
    caption VARCHAR(100),
    urutan SMALLINT DEFAULT 1,
    FOREIGN KEY (sarpras_id) REFERENCES sarpras(id) ON DELETE CASCADE
);
