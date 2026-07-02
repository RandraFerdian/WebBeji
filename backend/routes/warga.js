const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getWarga, createWarga, updateWarga, deleteWarga, getKategori } = require('../controllers/wargaController');

router.use(authenticateToken); // Protect all warga routes

router.get('/', getWarga);
router.get('/kategori', getKategori);
router.post('/', createWarga);
router.put('/:id', updateWarga);
router.delete('/:id', deleteWarga);

module.exports = router;
