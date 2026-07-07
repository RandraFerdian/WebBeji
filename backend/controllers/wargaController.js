const pool = require('../db');

// GET /api/warga
const getWarga = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, viewMode, perluUpdateKK } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT *, (YEAR(CURDATE()) - tahun_terbit_kk) >= 5 AS perlu_update_kk FROM warga';
        let whereClauses = [];
        const queryParams = [];

        if (search) {
            if (viewMode === 'kk') {
                whereClauses.push('no_kk IN (SELECT no_kk FROM warga WHERE nama_lengkap LIKE ? OR nik LIKE ? OR no_kk LIKE ?)');
            } else {
                whereClauses.push('(nama_lengkap LIKE ? OR nik LIKE ? OR no_kk LIKE ?)');
            }
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (perluUpdateKK === 'true') {
            whereClauses.push('(YEAR(CURDATE()) - tahun_terbit_kk) >= 5');
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(Number(limit), Number(offset));

        const [rows] = await pool.query(query, queryParams);

        // Count total
        let countQuery = 'SELECT COUNT(*) as total FROM warga';
        let countWhereClauses = [];
        const countParams = [];
        
        if (search) {
            if (viewMode === 'kk') {
                countWhereClauses.push('no_kk IN (SELECT no_kk FROM warga WHERE nama_lengkap LIKE ? OR nik LIKE ? OR no_kk LIKE ?)');
            } else {
                countWhereClauses.push('(nama_lengkap LIKE ? OR nik LIKE ? OR no_kk LIKE ?)');
            }
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (perluUpdateKK === 'true') {
            countWhereClauses.push('(YEAR(CURDATE()) - tahun_terbit_kk) >= 5');
        }

        if (countWhereClauses.length > 0) {
            countQuery += ' WHERE ' + countWhereClauses.join(' AND ');
        }
        const [[{ total }]] = await pool.query(countQuery, countParams);

        res.json({
            success: true,
            data: rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total
            },
            message: 'Berhasil mengambil data warga'
        });
    } catch (error) {
        console.error('Error in getWarga:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data warga' });
    }
};

// POST /api/warga
const createWarga = async (req, res) => {
    try {
        const data = req.body;
        
        let final_pendidikan_id = data.pendidikan_id;
        if (final_pendidikan_id && isNaN(Number(final_pendidikan_id))) {
            const [existing] = await pool.query('SELECT id FROM kategori_pendidikan WHERE nama = ?', [final_pendidikan_id]);
            if (existing.length > 0) {
                final_pendidikan_id = existing[0].id;
            } else {
                const [result] = await pool.query('INSERT INTO kategori_pendidikan (nama) VALUES (?)', [final_pendidikan_id]);
                final_pendidikan_id = result.insertId;
            }
        }

        let final_pekerjaan_id = data.pekerjaan_id;
        if (final_pekerjaan_id && isNaN(Number(final_pekerjaan_id))) {
            const [existing] = await pool.query('SELECT id FROM kategori_pekerjaan WHERE nama = ?', [final_pekerjaan_id]);
            if (existing.length > 0) {
                final_pekerjaan_id = existing[0].id;
            } else {
                const [result] = await pool.query('INSERT INTO kategori_pekerjaan (nama) VALUES (?)', [final_pekerjaan_id]);
                final_pekerjaan_id = result.insertId;
            }
        }

        const query = `
            INSERT INTO warga (
                nik, no_kk, tahun_terbit_kk, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, 
                agama, pendidikan_id, pekerjaan_id, golongan_darah, status_perkawinan, 
                status_hubungan_keluarga
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            data.nik, data.no_kk, data.tahun_terbit_kk || null, data.nama_lengkap, data.jenis_kelamin, 
            data.tempat_lahir, data.tanggal_lahir, data.agama, 
            final_pendidikan_id || null, final_pekerjaan_id || null, 
            data.golongan_darah || 'Tidak Diketahui', data.status_perkawinan, data.status_hubungan_keluarga
        ];

        const [result] = await pool.query(query, params);

        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'TAMBAH', `Menambah data warga NIK: ${data.nik}`]
        );

        res.status(201).json({ success: true, message: 'Berhasil menambah data warga', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error in createWarga:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'NIK sudah terdaftar' });
        }
        res.status(500).json({ success: false, message: 'Gagal menambah data warga' });
    }
};

// PUT /api/warga/:id
const updateWarga = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        let final_pendidikan_id = data.pendidikan_id;
        if (final_pendidikan_id && isNaN(Number(final_pendidikan_id))) {
            const [existing] = await pool.query('SELECT id FROM kategori_pendidikan WHERE nama = ?', [final_pendidikan_id]);
            if (existing.length > 0) {
                final_pendidikan_id = existing[0].id;
            } else {
                const [result] = await pool.query('INSERT INTO kategori_pendidikan (nama) VALUES (?)', [final_pendidikan_id]);
                final_pendidikan_id = result.insertId;
            }
        }

        let final_pekerjaan_id = data.pekerjaan_id;
        if (final_pekerjaan_id && isNaN(Number(final_pekerjaan_id))) {
            const [existing] = await pool.query('SELECT id FROM kategori_pekerjaan WHERE nama = ?', [final_pekerjaan_id]);
            if (existing.length > 0) {
                final_pekerjaan_id = existing[0].id;
            } else {
                const [result] = await pool.query('INSERT INTO kategori_pekerjaan (nama) VALUES (?)', [final_pekerjaan_id]);
                final_pekerjaan_id = result.insertId;
            }
        }

        const query = `
            UPDATE warga SET 
                nik = ?, no_kk = ?, tahun_terbit_kk = ?, nama_lengkap = ?, jenis_kelamin = ?, 
                tempat_lahir = ?, tanggal_lahir = ?, agama = ?, 
                pendidikan_id = ?, pekerjaan_id = ?, golongan_darah = ?, 
                status_perkawinan = ?, status_hubungan_keluarga = ?
            WHERE id = ?
        `;
        
        const params = [
            data.nik, data.no_kk, data.tahun_terbit_kk || null, data.nama_lengkap, data.jenis_kelamin, 
            data.tempat_lahir, data.tanggal_lahir, data.agama, 
            final_pendidikan_id || null, final_pekerjaan_id || null, 
            data.golongan_darah || 'Tidak Diketahui', data.status_perkawinan, data.status_hubungan_keluarga,
            id
        ];

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data warga tidak ditemukan' });
        }

        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'UBAH', `Mengubah data warga NIK: ${data.nik}`]
        );

        res.json({ success: true, message: 'Berhasil mengubah data warga' });
    } catch (error) {
        console.error('Error in updateWarga:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'NIK sudah terdaftar' });
        }
        res.status(500).json({ success: false, message: 'Gagal mengubah data warga' });
    }
};

// DELETE /api/warga/:id
const deleteWarga = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Dapatkan NIK sebelum dihapus untuk log
        const [[warga]] = await pool.query('SELECT nik FROM warga WHERE id = ?', [id]);
        if (!warga) {
            return res.status(404).json({ success: false, message: 'Data warga tidak ditemukan' });
        }

        await pool.query('DELETE FROM warga WHERE id = ?', [id]);

        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'HAPUS', `Menghapus data warga NIK: ${warga.nik}`]
        );

        res.json({ success: true, message: 'Berhasil menghapus data warga' });
    } catch (error) {
        console.error('Error in deleteWarga:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus data warga' });
    }
};

// GET /api/warga/kategori
const getKategori = async (req, res) => {
    try {
        const [pendidikan] = await pool.query('SELECT * FROM kategori_pendidikan ORDER BY id ASC');
        const [pekerjaan] = await pool.query('SELECT * FROM kategori_pekerjaan ORDER BY nama ASC');
        res.json({ success: true, data: { pendidikan, pekerjaan } });
    } catch (error) {
        console.error('Error in getKategori:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil kategori' });
    }
};

module.exports = { getWarga, createWarga, updateWarga, deleteWarga, getKategori };
