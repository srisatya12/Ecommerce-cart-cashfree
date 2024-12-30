const express = require('express');
const { createOrder, paymentWebhook } = require('../controllers/paymentController');
const router = express.Router();


router.post('/create-order', createOrder);


router.post('/webhook', paymentWebhook);

module.exports = router;
