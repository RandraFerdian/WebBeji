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

// GET /api/peta
const getPeta = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM peta ORDER BY created_at DESC');
        res.json({
            success: true,
            data: rows,
            message: 'Berhasil mengambil data peta'
        });
    } catch (error) {
        console.error('Error in getPeta:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data peta' });
    }
};

// POST /api/peta
const createPeta = async (req, res) => {
    try {
        const { judul, image_url, deskripsi } = req.body;
        
        const query = `
            INSERT INTO peta (judul, image_url, deskripsi) 
            VALUES (?, ?, ?)
        `;
        const params = [judul, image_url, deskripsi || null];

        const [result] = await pool.query(query, params);

        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'TAMBAH', `Menambah peta: ${judul}`]
        );

        res.status(201).json({ success: true, message: 'Peta berhasil ditambahkan', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error in createPeta:', error);
        res.status(500).json({ success: false, message: 'Gagal menambah peta' });
    }
};

// DELETE /api/peta/:id
const deletePeta = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [[peta]] = await pool.query('SELECT judul, image_url FROM peta WHERE id = ?', [id]);
        if (!peta) {
            return res.status(404).json({ success: false, message: 'Peta tidak ditemukan' });
        }

        // Hapus gambar di Cloudinary
        const publicId = extractPublicId(peta.image_url);
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
                console.log(`Berhasil menghapus gambar ${publicId} dari Cloudinary`);
            } catch (cloudErr) {
                console.error('Gagal menghapus gambar di Cloudinary:', cloudErr);
                // Kita tetap melanjutkan penghapusan di database meskipun Cloudinary gagal
            }
        }

        await pool.query('DELETE FROM peta WHERE id = ?', [id]);

        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'HAPUS', `Menghapus peta: ${peta.judul}`]
        );

        res.json({ success: true, message: 'Peta berhasil dihapus' });
    } catch (error) {
        console.error('Error in deletePeta:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus peta' });
    }
};

// PUT /api/peta/:id
const updatePeta = async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, image_url, deskripsi } = req.body;
        
        // Ambil data peta lama untuk mengecek apakah gambar berubah
        const [[oldPeta]] = await pool.query('SELECT judul, image_url FROM peta WHERE id = ?', [id]);
        if (!oldPeta) {
            return res.status(404).json({ success: false, message: 'Peta tidak ditemukan' });
        }

        const query = `
            UPDATE peta SET 
                judul = ?, image_url = ?, deskripsi = ?
            WHERE id = ?
        `;
        const params = [judul, image_url, deskripsi || null, id];

        const [result] = await pool.query(query, params);

        // Jika gambar berubah, hapus gambar lama dari Cloudinary
        if (oldPeta.image_url && oldPeta.image_url !== image_url) {
            const publicId = extractPublicId(oldPeta.image_url);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Berhasil menghapus gambar lama ${publicId} dari Cloudinary`);
                } catch (cloudErr) {
                    console.error('Gagal menghapus gambar lama di Cloudinary:', cloudErr);
                }
            }
        }

        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [req.user.id, 'EDIT', `Mengubah peta: ${judul}`]
        );

        res.json({ success: true, message: 'Peta berhasil diubah' });
    } catch (error) {
        console.error('Error in updatePeta:', error);
        res.status(500).json({ success: false, message: 'Gagal mengubah peta' });
    }
};

module.exports = { getPeta, createPeta, updatePeta, deletePeta };

