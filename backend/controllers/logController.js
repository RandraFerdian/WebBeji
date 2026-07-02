const pool = require('../db');

// GET /api/log
const getLogs = async (req, res) => {
    try {
        const { limit = 50 } = req.query; // Paginasi sederhana atau ambil 50 terakhir
        
        const [logs] = await pool.query(`
            SELECT l.*, a.nama_lengkap as nama_admin 
            FROM log_aktivitas l 
            JOIN admin a ON l.admin_id = a.id 
            ORDER BY l.timestamp DESC 
            LIMIT ?
        `, [parseInt(limit)]);

        res.json({
            success: true,
            data: logs,
            message: 'Berhasil mengambil log aktivitas'
        });
    } catch (error) {
        console.error('Error in getLogs:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil log' });
    }
};

module.exports = { getLogs };
