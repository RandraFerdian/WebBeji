const pool = require('../db');

// GET /api/sarpras
const getSarpras = async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM sarpras';
        const queryParams = [];

        if (search) {
            query += ' WHERE nama LIKE ? OR deskripsi_singkat LIKE ? OR deskripsi_detail LIKE ?';
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.query(query, queryParams);

        // Ambil foto untuk setiap sarpras
        for (let sarpras of rows) {
            const [photos] = await pool.query('SELECT * FROM foto_sarpras WHERE sarpras_id = ? ORDER BY urutan ASC', [sarpras.id]);
            sarpras.fotos = photos;
        }

        res.json({
            success: true,
            data: rows,
            message: 'Berhasil mengambil data sarpras'
        });
    } catch (error) {
        console.error('Error in getSarpras:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data sarpras' });
    }
};

// GET /api/sarpras/:id
const getSarprasById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM sarpras WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sarpras tidak ditemukan' });
        }

        const sarpras = rows[0];
        const [photos] = await pool.query('SELECT * FROM foto_sarpras WHERE sarpras_id = ? ORDER BY urutan ASC', [sarpras.id]);
        sarpras.fotos = photos;

        res.json({ success: true, data: sarpras, message: 'Berhasil mengambil detail sarpras' });
    } catch (error) {
        console.error('Error in getSarprasById:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil detail sarpras' });
    }
};

// POST /api/sarpras
const createSarpras = async (req, res) => {
    try {
        const { nama, deskripsi_singkat, deskripsi_detail, cover_url, fotos } = req.body;
        
        const query = `
            INSERT INTO sarpras (nama, deskripsi_singkat, deskripsi_detail, cover_url) 
            VALUES (?, ?, ?, ?)
        `;
        const params = [nama, deskripsi_singkat, deskripsi_detail, cover_url || null];

        const [result] = await pool.query(query, params);
        
        if (fotos && Array.isArray(fotos)) {
            for (let i = 0; i < fotos.length; i++) {
                const url = typeof fotos[i] === 'string' ? fotos[i] : fotos[i].url;
                await pool.query('INSERT INTO foto_sarpras (sarpras_id, url, urutan) VALUES (?, ?, ?)', [result.insertId, url, i + 1]);
            }
        }

        if (req.user && req.user.id) {
            await pool.query(
                'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
                [req.user.id, 'TAMBAH', `Menambah Sarpras: ${nama}`]
            );
        }

        res.status(201).json({ success: true, message: 'Berhasil menambah sarpras', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error in createSarpras:', error);
        res.status(500).json({ success: false, message: 'Gagal menambah sarpras' });
    }
};

// PUT /api/sarpras/:id
const updateSarpras = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, deskripsi_singkat, deskripsi_detail, cover_url, fotos } = req.body;
        
        const query = `
            UPDATE sarpras SET 
                nama = ?, deskripsi_singkat = ?, deskripsi_detail = ?, cover_url = ?
            WHERE id = ?
        `;
        const params = [nama, deskripsi_singkat, deskripsi_detail, cover_url || null, id];

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data sarpras tidak ditemukan' });
        }

        if (fotos && Array.isArray(fotos)) {
            // Delete old photos
            await pool.query('DELETE FROM foto_sarpras WHERE sarpras_id = ?', [id]);
            // Insert new photos
            for (let i = 0; i < fotos.length; i++) {
                const url = typeof fotos[i] === 'string' ? fotos[i] : fotos[i].url;
                await pool.query('INSERT INTO foto_sarpras (sarpras_id, url, urutan) VALUES (?, ?, ?)', [id, url, i + 1]);
            }
        }

        if (req.user && req.user.id) {
            await pool.query(
                'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
                [req.user.id, 'UBAH', `Mengubah Sarpras: ${nama}`]
            );
        }

        res.json({ success: true, message: 'Berhasil mengubah data sarpras' });
    } catch (error) {
        console.error('Error in updateSarpras:', error);
        res.status(500).json({ success: false, message: 'Gagal mengubah data sarpras' });
    }
};

// DELETE /api/sarpras/:id
const deleteSarpras = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM sarpras WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data sarpras tidak ditemukan' });
        }
        
        if (req.user && req.user.id) {
            await pool.query(
                'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
                [req.user.id, 'HAPUS', `Menghapus Sarpras ID: ${id}`]
            );
        }

        res.json({ success: true, message: 'Berhasil menghapus data sarpras' });
    } catch (error) {
        console.error('Error in deleteSarpras:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus data sarpras' });
    }
};

module.exports = { getSarpras, getSarprasById, createSarpras, updateSarpras, deleteSarpras };
