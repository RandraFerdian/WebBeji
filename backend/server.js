const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const path = require('path');

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || '*'
}));

// Proteksi Rate Limiting API Global (Anti Brute Force & DDoS)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 1000, // Limit 1000 request per IP per 15 menit (agak longgar untuk global)
    message: { success: false, message: 'Terlalu banyak request dari IP ini, silakan coba lagi setelah 15 menit' }
});

// Proteksi lebih ketat khusus untuk route auth/login
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10, // Maksimal 10x percobaan login salah per 15 menit
    message: { success: false, message: 'Terlalu banyak percobaan login, silakan coba lagi setelah 15 menit' }
});

app.use('/api/', apiLimiter);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Import and use routes here
const authRoutes = require('./routes/auth');
const wargaRoutes = require('./routes/warga');
const umkmRoutes = require('./routes/umkm');
const sarprasRoutes = require('./routes/sarprasRoutes');
const beritaRoutes = require('./routes/berita');
const petaRoutes = require('./routes/peta');
const perangkatRoutes = require('./routes/perangkat');
const pengaturanRoutes = require('./routes/pengaturan');
const statistikRoutes = require('./routes/statistik');
const adminStatsRoutes = require('./routes/adminStats');
const uploadRoutes = require('./routes/upload');
const logRoutes = require('./routes/log');
const adminManajemenRoutes = require('./routes/adminManajemen');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/warga', wargaRoutes);
app.use('/api/umkm', umkmRoutes);
app.use('/api/sarpras', sarprasRoutes);
app.use('/api/berita', beritaRoutes);
app.use('/api/peta', petaRoutes);
app.use('/api/perangkat', perangkatRoutes);
app.use('/api/pengaturan', pengaturanRoutes);
app.use('/api/statistik', statistikRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/manajemen', adminManajemenRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/log', logRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
