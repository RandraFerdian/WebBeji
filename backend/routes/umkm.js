const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUmkm, getUmkmById, createUmkm, updateUmkm, deleteUmkm } = require('../controllers/umkmController');

// Public route to get all UMKM (should be filtered by active status in frontend/controller)
router.get('/', getUmkm);

// Public route to get detail UMKM
router.get('/:id', getUmkmById);

// Protected routes
router.use(authenticateToken);
router.post('/', createUmkm);
router.put('/:id', updateUmkm);
router.delete('/:id', deleteUmkm);

module.exports = router;
