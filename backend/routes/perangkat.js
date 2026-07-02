const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getPerangkat, createPerangkat, updatePerangkat, deletePerangkat } = require('../controllers/perangkatController');

router.get('/', getPerangkat);

router.use(authenticateToken);
router.post('/', createPerangkat);
router.put('/:id', updatePerangkat);
router.delete('/:id', deletePerangkat);

module.exports = router;
