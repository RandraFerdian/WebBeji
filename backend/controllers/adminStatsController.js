const pool = require('../db');

// GET /api/admin/stats
const getAdminStats = async (req, res) => {
    try {
        const [[{ total_warga }]] = await pool.query('SELECT COUNT(*) as total_warga FROM warga');
        const [[{ umkm_aktif }]] = await pool.query("SELECT COUNT(*) as umkm_aktif FROM umkm WHERE status = 'aktif'");
        const [[{ berita_publik }]] = await pool.query("SELECT COUNT(*) as berita_publik FROM berita WHERE status = 'published'");
        
        // Log aktivitas hari ini
        const [[{ aktivitas_hari_ini }]] = await pool.query('SELECT COUNT(*) as aktivitas_hari_ini FROM log_aktivitas WHERE DATE(timestamp) = CURDATE()');

        // Log terbaru
        const [logs] = await pool.query(`
            SELECT l.*, a.nama_lengkap as nama_admin 
            FROM log_aktivitas l 
            JOIN admin a ON l.admin_id = a.id 
            ORDER BY l.timestamp DESC 
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                total_warga,
                umkm_aktif,
                berita_publik,
                aktivitas_hari_ini,
                logs
            },
            message: 'Berhasil mengambil statistik admin'
        });
    } catch (error) {
        console.error('Error in getAdminStats:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil statistik admin' });
    }
};

module.exports = { getAdminStats };
