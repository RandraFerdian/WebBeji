const express = require('express');
const router = express.Router();
const { getStatistik } = require('../controllers/statistikController');

// GET /api/statistik
router.get('/', getStatistik);

module.exports = router;
