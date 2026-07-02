const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getPeta, createPeta, updatePeta, deletePeta } = require('../controllers/petaController');

// Public route
router.get('/', getPeta);

// Protected routes
router.use(authenticateToken);
router.post('/', createPeta);
router.put('/:id', updatePeta);
router.delete('/:id', deletePeta);

module.exports = router;
