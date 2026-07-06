const pool = require('../db');

// GET /api/statistik
const getStatistik = async (req, res) => {
    try {
        const [[{ total_warga }]] = await pool.query('SELECT COUNT(*) as total_warga FROM warga');
        const [[{ total_kk }]] = await pool.query('SELECT COUNT(DISTINCT no_kk) as total_kk FROM warga');
        
        // Gender
        const [genderRows] = await pool.query('SELECT jenis_kelamin, COUNT(*) as count FROM warga GROUP BY jenis_kelamin');
        let laki_laki = 0, perempuan = 0;
        genderRows.forEach(row => {
            if (row.jenis_kelamin === 'L') laki_laki = row.count;
            if (row.jenis_kelamin === 'P') perempuan = row.count;
        });

        // Agama
        const [agamaRows] = await pool.query('SELECT agama as nama, COUNT(*) as count FROM warga GROUP BY agama ORDER BY count DESC');

        // Status Perkawinan
        const [kawinRows] = await pool.query('SELECT status_perkawinan as nama, COUNT(*) as count FROM warga GROUP BY status_perkawinan ORDER BY count DESC');

        // Golongan Darah
        const [darahRows] = await pool.query('SELECT COALESCE(golongan_darah, "Tidak Diketahui") as nama, COUNT(*) as count FROM warga GROUP BY golongan_darah ORDER BY count DESC');

        // Kelompok Umur
        const [[umurRow]] = await pool.query(`
            SELECT 
                SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 5 THEN 1 ELSE 0 END) as balita,
                SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 5 AND 17 THEN 1 ELSE 0 END) as remaja,
                SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 18 AND 59 THEN 1 ELSE 0 END) as dewasa,
                SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60 THEN 1 ELSE 0 END) as lansia
            FROM warga
        `);
        const umur = [
            { nama: 'Balita (0-4 Th)', count: umurRow.balita || 0 },
            { nama: 'Anak & Remaja (5-17 Th)', count: umurRow.remaja || 0 },
            { nama: 'Dewasa (18-59 Th)', count: umurRow.dewasa || 0 },
            { nama: 'Lansia (60+ Th)', count: umurRow.lansia || 0 }
        ];

        // Pendidikan
        const [pendidikanRows] = await pool.query(`
            SELECT k.nama, COUNT(w.id) as count 
            FROM kategori_pendidikan k 
            LEFT JOIN warga w ON w.pendidikan_id = k.id 
            GROUP BY k.id, k.nama ORDER BY k.id ASC
        `);

        // Pekerjaan
        const [pekerjaanRows] = await pool.query(`
            SELECT k.nama, COUNT(w.id) as count 
            FROM kategori_pekerjaan k 
            LEFT JOIN warga w ON w.pekerjaan_id = k.id 
            GROUP BY k.id, k.nama ORDER BY count DESC
        `);

        res.json({
            success: true,
            data: {
                total_warga, total_kk, laki_laki, perempuan,
                pendidikan: pendidikanRows,
                pekerjaan: pekerjaanRows,
                agama: agamaRows,
                status_perkawinan: kawinRows,
                golongan_darah: darahRows,
                kelompok_umur: umur
            },
            message: 'Berhasil mengambil statistik'
        });
    } catch (error) {
        console.error('Error in getStatistik:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data statistik' });
    }
};

module.exports = { getStatistik };
