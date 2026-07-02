const express = require('express');
const router = express.Router();
const { getAllAdmins, createAdmin, deleteAdmin } = require('../controllers/adminManajemenController');
const { authenticateToken } = require('../middleware/auth'); 

// Terapkan middleware pada semua endpoint ini
router.use(authenticateToken);

router.get('/', getAllAdmins);
router.post('/', createAdmin);
router.delete('/:id', deleteAdmin);

module.exports = router;
