const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getBerita, getBeritaBySlug, createBerita, updateBerita, deleteBerita } = require('../controllers/beritaController');

// Public endpoints
router.get('/', getBerita); // Frontend will pass ?status=published for public view
router.get('/:slug', getBeritaBySlug);

// Protected endpoints
router.use(authenticateToken);
router.post('/', createBerita);
router.put('/:id', updateBerita);
router.delete('/:id', deleteBerita);

module.exports = router;
