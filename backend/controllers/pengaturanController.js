const pool = require('../db');

// GET /api/pengaturan
const getPengaturan = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT kunci, nilai FROM pengaturan');
        // Convert to an object { visi: '...', misi: '...' }
        const config = {};
        rows.forEach(row => {
            config[row.kunci] = row.nilai;
        });
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error getPengaturan:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pengaturan' });
    }
};

// PUT /api/pengaturan
const updatePengaturan = async (req, res) => {
    try {
        const settings = req.body; // Expects object: { visi: '...', misi: '...' }
        
        // Loop through keys and upsert (insert or update)
        for (const [kunci, nilai] of Object.entries(settings)) {
            await pool.query(
                'INSERT INTO pengaturan (kunci, nilai) VALUES (?, ?) ON DUPLICATE KEY UPDATE nilai = ?',
                [kunci, nilai, nilai]
            );
        }

        await pool.query('INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'UBAH', 'Memperbarui profil / Visi Misi dusun']);

        res.json({ success: true, message: 'Berhasil menyimpan pengaturan' });
    } catch (error) {
        console.error('Error updatePengaturan:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan pengaturan' });
    }
};

module.exports = { getPengaturan, updatePengaturan };
