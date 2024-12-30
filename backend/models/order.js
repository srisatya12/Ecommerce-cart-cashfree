
const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
  cf_order_id: { type: String, required: true },
  order_id: { type: String, required: true },
  order_amount: { type: Number, required: true },
  order_currency: { type: String, required: true },
  customer_id: { type: String, required: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String, required: true },
  order_status: { type: String, default: 'ACTIVE' },
  order_meta: {
    notify_url: { type: String },
    payment_methods: { type: String },
  },
  created_at: { type: Date, default: Date.now },
});


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
