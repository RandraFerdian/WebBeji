const pool = require('../db');
const cloudinary = require('cloudinary').v2;

const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    try {
        const splitUrl = url.split('/upload/');
        if (splitUrl.length > 1) {
            let path = splitUrl[1];
            if (path.match(/^v\d+\//)) {
                path = path.substring(path.indexOf('/') + 1);
            }
            const publicId = path.substring(0, path.lastIndexOf('.'));
            return publicId || path;
        }
    } catch (err) {
        return null;
    }
    return null;
};

// GET /api/perangkat
const getPerangkat = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM perangkat_desa ORDER BY urutan ASC, created_at ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error getPerangkat:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data perangkat' });
    }
};

// POST /api/perangkat
const createPerangkat = async (req, res) => {
    try {
        const { nama, jabatan, foto_url, urutan, nomor_hp } = req.body;
        const [result] = await pool.query(
            'INSERT INTO perangkat_desa (nama, jabatan, foto_url, urutan, nomor_hp) VALUES (?, ?, ?, ?, ?)',
            [nama, jabatan, foto_url || null, urutan || 0, nomor_hp || null]
        );
        
        await pool.query('INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'TAMBAH', `Menambah Aparatur: ${nama}`]);

        res.status(201).json({ success: true, message: 'Berhasil menambah aparatur', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error createPerangkat:', error);
        res.status(500).json({ success: false, message: 'Gagal menambah data' });
    }
};

// PUT /api/perangkat/:id
const updatePerangkat = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, jabatan, foto_url, urutan, nomor_hp } = req.body;

        const [[oldData]] = await pool.query('SELECT foto_url FROM perangkat_desa WHERE id = ?', [id]);
        if (!oldData) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

        await pool.query(
            'UPDATE perangkat_desa SET nama=?, jabatan=?, foto_url=?, urutan=?, nomor_hp=? WHERE id=?',
            [nama, jabatan, foto_url || null, urutan || 0, nomor_hp || null, id]
        );

        if (oldData.foto_url && oldData.foto_url !== foto_url) {
            const publicId = extractPublicId(oldData.foto_url);
            if (publicId) await cloudinary.uploader.destroy(publicId).catch(console.error);
        }

        await pool.query('INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'UBAH', `Mengubah Aparatur: ${nama}`]);

        res.json({ success: true, message: 'Berhasil mengubah data' });
    } catch (error) {
        console.error('Error updatePerangkat:', error);
        res.status(500).json({ success: false, message: 'Gagal mengubah data' });
    }
};

// DELETE /api/perangkat/:id
const deletePerangkat = async (req, res) => {
    try {
        const { id } = req.params;
        const [[oldData]] = await pool.query('SELECT foto_url, nama FROM perangkat_desa WHERE id = ?', [id]);
        if (!oldData) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

        if (oldData.foto_url) {
            const publicId = extractPublicId(oldData.foto_url);
            if (publicId) await cloudinary.uploader.destroy(publicId).catch(console.error);
        }

        await pool.query('DELETE FROM perangkat_desa WHERE id = ?', [id]);

        await pool.query('INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'HAPUS', `Menghapus Aparatur: ${oldData.nama}`]);

        res.json({ success: true, message: 'Berhasil menghapus data' });
    } catch (error) {
        console.error('Error deletePerangkat:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus data' });
    }
};

module.exports = { getPerangkat, createPerangkat, updatePerangkat, deletePerangkat };
