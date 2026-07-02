const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
        }

        const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);
        
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }

        // Create JWT (expires in 2 hours as per SRS)
        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '2h' }
        );

        // Log login activity
        await pool.query(
            'INSERT INTO log_aktivitas (admin_id, aksi, deskripsi) VALUES (?, ?, ?)',
            [admin.id, 'LOGIN', 'Admin login ke sistem']
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: admin.id,
                    username: admin.username,
                    nama_lengkap: admin.nama_lengkap,
                    role: admin.role
                }
            },
            message: 'Login berhasil'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
};

module.exports = { login };
