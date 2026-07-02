const pool = require('../db');

// GET /api/umkm (For admin: all status, For public: only active)
const getUmkm = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = 'SELECT u.*, w.nama_lengkap as nama_pemilik FROM umkm u LEFT JOIN warga w ON u.pemilik_id = w.id';
        const queryParams = [];

        const conditions = [];
        if (search) {
            conditions.push('(u.nama_usaha LIKE ? OR u.deskripsi LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }
        if (status) {
            conditions.push('u.status = ?');
            queryParams.push(status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY u.created_at DESC';

        const [rows] = await pool.query(query, queryParams);

        // Fetch photos for each UMKM
        for (let umkm of rows) {
            const [photos] = await pool.query('SELECT * FROM foto_umkm WHERE umkm_id = ? ORDER BY urutan ASC', [umkm.id]);
            umkm.fotos = photos;
        }

        res.json({
            success: true,
            data: rows,
            message: 'Berhasil mengambil data UMKM'
        });
    } catch (error) {
        console.error('Error in getUmkm:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data UMKM' });
    }
};

// POST /api/umkm
const createUmkm = async (req, res) => {
    try {
        const { pemilik_id, nama_usaha, deskripsi, nomor_wa, link_gmaps, status, foto_url } = req.body;
        
        const query = `
            INSERT INTO umkm (pemilik_id, nama_usaha, deskripsi, nomor_wa, link_gmaps, status) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [pemilik_id || null, nama_usaha, deskripsi, nomor_wa, link_gmaps, status || 'aktif'];

        const [result] = await pool.query(query, params);
        
        if (foto_url) {
            await pool.query('INSERT INTO foto_umkm (umkm_id, url) VALUES (?, ?)', [result.insertId, foto_url]);
        }

        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'TAMBAH', `Menambah UMKM: ${nama_usaha}`]
        );

        res.status(201).json({ success: true, message: 'Berhasil menambah UMKM', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error in createUmkm:', error);
        res.status(500).json({ success: false, message: 'Gagal menambah UMKM' });
    }
};

// PUT /api/umkm/:id
const updateUmkm = async (req, res) => {
    try {
        const { id } = req.params;
        const { pemilik_id, nama_usaha, deskripsi, nomor_wa, link_gmaps, status, foto_url } = req.body;
        
        const query = `
            UPDATE umkm SET 
                pemilik_id = ?, nama_usaha = ?, deskripsi = ?, 
                nomor_wa = ?, link_gmaps = ?, status = ?
            WHERE id = ?
        `;
        const params = [pemilik_id || null, nama_usaha, deskripsi, nomor_wa, link_gmaps, status, id];

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data UMKM tidak ditemukan' });
        }

        if (foto_url) {
            await pool.query('DELETE FROM foto_umkm WHERE umkm_id = ?', [id]);
            await pool.query('INSERT INTO foto_umkm (umkm_id, url) VALUES (?, ?)', [id, foto_url]);
        }

        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'UBAH', `Mengubah UMKM: ${nama_usaha}`]
        );

        res.json({ success: true, message: 'Berhasil mengubah data UMKM' });
    } catch (error) {
        console.error('Error in updateUmkm:', error);
        res.status(500).json({ success: false, message: 'Gagal mengubah data UMKM' });
    }
};

// DELETE /api/umkm/:id
const deleteUmkm = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM umkm WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data UMKM tidak ditemukan' });
        }
        
        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'HAPUS', `Menghapus UMKM ID: ${id}`]
        );

        res.json({ success: true, message: 'Berhasil menghapus data UMKM' });
    } catch (error) {
        console.error('Error in deleteUmkm:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus data UMKM' });
    }
};

// GET /api/umkm/:id
const getUmkmById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT u.*, w.nama_lengkap as nama_pemilik FROM umkm u LEFT JOIN warga w ON u.pemilik_id = w.id WHERE u.id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan' });
        }

        const umkm = rows[0];
        const [photos] = await pool.query('SELECT * FROM foto_umkm WHERE umkm_id = ? ORDER BY urutan ASC', [umkm.id]);
        umkm.fotos = photos;

        res.json({ success: true, data: umkm, message: 'Berhasil mengambil detail UMKM' });
    } catch (error) {
        console.error('Error in getUmkmById:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil detail UMKM' });
    }
};

module.exports = { getUmkm, getUmkmById, createUmkm, updateUmkm, deleteUmkm };
