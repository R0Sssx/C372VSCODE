// Payment Routes (no login required for this classroom mock)
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/payments/prepare/:serviceId', paymentController.preparePayment);
router.post('/payments/create/:serviceId', paymentController.createMockPayment);
// Missing id (/payments/prepare or /payments/prepare/) -> 404 JSON from the same handler
router.get('/payments/prepare', paymentController.preparePayment);

module.exports = router;
