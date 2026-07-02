const pool = require('../db');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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

// GET /api/berita
const getBerita = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT b.*, a.nama_lengkap as nama_penulis 
            FROM berita b 
            JOIN admin a ON b.admin_id = a.id
        `;
        const queryParams = [];

        if (status) {
            query += ' WHERE b.status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY b.created_at DESC';

        const [rows] = await pool.query(query, queryParams);

        res.json({
            success: true,
            data: rows,
            message: 'Berhasil mengambil data berita'
        });
    } catch (error) {
        console.error('Error in getBerita:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data berita' });
    }
};

// GET /api/berita/:slug
const getBeritaBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [rows] = await pool.query(`
            SELECT b.*, a.nama_lengkap as nama_penulis 
            FROM berita b 
            JOIN admin a ON b.admin_id = a.id 
            WHERE b.slug = ?
        `, [slug]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
        }

        res.json({ success: true, data: rows[0], message: 'Berhasil mengambil berita' });
    } catch (error) {
        console.error('Error in getBeritaBySlug:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil berita' });
    }
};

// POST /api/berita
const createBerita = async (req, res) => {
    try {
        const { judul, slug, konten, thumbnail_url, status } = req.body;
        const admin_id = req.user.id;

        let published_at = null;
        if (status === 'published') {
            published_at = new Date();
        }

        const query = `
            INSERT INTO berita (admin_id, judul, slug, konten, thumbnail_url, status, published_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [admin_id, judul, slug, konten, thumbnail_url || null, status || 'draft', published_at];

        const [result] = await pool.query(query, params);

        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [admin_id, 'TAMBAH', `Membuat berita: ${judul}`]
        );

        res.status(201).json({ success: true, message: 'Berita berhasil dibuat', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error in createBerita:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Slug berita sudah ada (harus unik)' });
        }
        res.status(500).json({ success: false, message: 'Gagal membuat berita' });
    }
};

// PUT /api/berita/:id
const updateBerita = async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, slug, konten, thumbnail_url, status } = req.body;
        
        // Ambil data berita lama untuk mengecek gambar berubah
        const [[oldBerita]] = await pool.query('SELECT thumbnail_url FROM berita WHERE id = ?', [id]);
        if (!oldBerita) {
            return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
        }

        let updateQuery = 'UPDATE berita SET judul=?, slug=?, konten=?, thumbnail_url=?, status=?';
        const params = [judul, slug, konten, thumbnail_url || null, status];

        if (status === 'published') {
            updateQuery += ', published_at=COALESCE(published_at, NOW())';
        }

        updateQuery += ' WHERE id=?';
        params.push(id);

        await pool.query(updateQuery, params);

        // Jika thumbnail berubah, hapus thumbnail lama dari Cloudinary
        if (oldBerita.thumbnail_url && oldBerita.thumbnail_url !== thumbnail_url) {
            const publicId = extractPublicId(oldBerita.thumbnail_url);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Berhasil menghapus thumbnail lama ${publicId} dari Cloudinary`);
                } catch (cloudErr) {
                    console.error('Gagal menghapus thumbnail lama di Cloudinary:', cloudErr);
                }
            }
        }

        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'EDIT', `Mengubah berita ID: ${id}`]
        );

        res.json({ success: true, message: 'Berita berhasil diubah' });
    } catch (error) {
        console.error('Error in updateBerita:', error);
        res.status(500).json({ success: false, message: 'Gagal mengubah berita' });
    }
};

// DELETE /api/berita/:id
const deleteBerita = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Ambil thumbnail_url sebelum menghapus row
        const [[berita]] = await pool.query('SELECT thumbnail_url FROM berita WHERE id = ?', [id]);
        if (!berita) {
            return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
        }

        // Hapus thumbnail di Cloudinary jika ada
        if (berita.thumbnail_url) {
            const publicId = extractPublicId(berita.thumbnail_url);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Berhasil menghapus thumbnail ${publicId} dari Cloudinary`);
                } catch (cloudErr) {
                    console.error('Gagal menghapus thumbnail di Cloudinary:', cloudErr);
                }
            }
        }

        await pool.query('DELETE FROM berita WHERE id = ?', [id]);
        
        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'HAPUS', `Menghapus berita ID: ${id}`]
        );

        res.json({ success: true, message: 'Berita berhasil dihapus' });
    } catch (error) {
        console.error('Error in deleteBerita:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus berita' });
    }
};

module.exports = { getBerita, getBeritaBySlug, createBerita, updateBerita, deleteBerita };
