const express = require('express');

const router = express.Router();
const cartController = require('../controllers/cartController');

const app = express();
app.use(express.json());


router.post('/cart/:userId/add', cartController.addItemToCart);


router.delete('/cart/:userId/remove', cartController.removeItemFromCart);


router.put('/cart/:userId/update', cartController.updateItemQuantity);


router.get('/cart/:userId', cartController.getCartDetails);

module.exports = router;
