const pool = require('../db');
const bcrypt = require('bcrypt');

const getAllAdmins = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, username, nama_lengkap, role FROM admin');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data admin' });
    }
};

const createAdmin = async (req, res) => {
    try {
        const { email, username, password, nama_lengkap, role } = req.body;

        if (!email || !username || !password || !nama_lengkap) {
            return res.status(400).json({ success: false, message: 'Semua field (email, username, password, nama_lengkap) wajib diisi' });
        }

        // Cek username atau email apakah sudah ada
        const [existing] = await pool.query('SELECT id FROM admin WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const adminRole = role || 'admin';

        await pool.query(
            'INSERT INTO admin (email, username, password, nama_lengkap, role) VALUES (?, ?, ?, ?, ?)',
            [email, username, hashedPassword, nama_lengkap, adminRole]
        );

        // Log Aktivitas
        const userActionId = req.user ? req.user.id : null;
        if (userActionId) {
            await pool.query(
                'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
                [userActionId, 'CREATE_ADMIN', `Menambahkan admin baru: ${username}`]
            );
        }

        res.status(201).json({ success: true, message: 'Admin berhasil ditambahkan' });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan admin' });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Jangan izinkan hapus admin super (opsional) atau admin yang sedang login
        if (req.user && req.user.id === parseInt(id)) {
            return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun Anda sendiri' });
        }

        const [result] = await pool.query('DELETE FROM admin WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
        }

        // Log Aktivitas
        const userActionId = req.user ? req.user.id : null;
        if (userActionId) {
            await pool.query(
                'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
                [userActionId, 'DELETE_ADMIN', `Menghapus admin dengan ID: ${id}`]
            );
        }

        res.json({ success: true, message: 'Admin berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus admin' });
    }
};

module.exports = { getAllAdmins, createAdmin, deleteAdmin };
