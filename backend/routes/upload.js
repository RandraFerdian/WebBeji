const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const { authenticateToken } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Konfigurasi Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Gunakan memory storage agar file bisa diproses oleh sharp sebelum di-upload
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Izinkan hingga 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diizinkan!'));
        }
    }
});

router.use(authenticateToken);

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
        }

        // Proses gambar dengan sharp (Kompresi & Resize)
        const imageBuffer = await sharp(req.file.buffer)
            .resize({ width: 1200, withoutEnlargement: true }) // Maksimal lebar 1200px
            .webp({ quality: 80 }) // Konversi ke WEBP
            .toBuffer();
            
        // Buat Stream Upload ke Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'desa_beji', // Folder khusus di Cloudinary
                format: 'webp',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ success: false, message: 'Gagal mengunggah ke Cloudinary' });
                }
                // Kirim URL asli dari server Cloudinary ke frontend
                res.json({ success: true, url: result.secure_url, message: 'Berhasil mengunggah gambar' });
            }
        );

        // Ubah Buffer menjadi Readable Stream lalu kirim ke Cloudinary
        const readableStream = new Readable();
        readableStream.push(imageBuffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);

    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ success: false, message: 'Gagal memproses gambar' });
    }
});

module.exports = router;
