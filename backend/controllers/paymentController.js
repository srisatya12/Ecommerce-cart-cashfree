const { Cashfree } = require("cashfree-pg");
const Cart = require("../models/cart");
const User = require("../models/user");
const Order = require('../models/order');  

const createOrder = async (req, res) => {
  const { user_id } = req.body;

  
  const cart = await Cart.findOne({ userId: user_id });
  if (!cart) {
    return res.status(404).json({ error: "Cart not found for the user." });
  }

  
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  
  const totalAmount = cart.totalAmount;

 
  Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
  Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
  Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

  const orderRequest = {
    order_amount: totalAmount,
    order_currency: "INR",
    customer_details: {
      customer_id: user._id.toString(), 
      customer_name: user.name,  
      customer_email: user.email,  
      customer_phone: user.phoneNumber, 
    },
    order_meta: { 
    notify_url: process.env.NOTIFY_URL
    }

  }

  try {
    const response = await Cashfree.PGCreateOrder("2023-08-01", orderRequest);


    const newOrder = new Order({
      cf_order_id: response.data.cf_order_id,
      order_id: response.data.order_id,
      order_amount: response.data.order_amount,
      order_currency: response.data.order_currency,
      customer_id: user._id.toString(),
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: user.phoneNumber,
      order_status: response.data.order_status,
      order_meta: response.data.order_meta,
    });

    
    await newOrder.save();


    res.json(response.data);
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to create order." });
  }
};

const paymentWebhook = async (req, res) => {
  try {
   

    const { data } = req.body;
    const {
      order: { order_id, order_amount, order_currency },
      payment: { payment_status, payment_amount, payment_currency, payment_time, cf_payment_id },
      customer_details: { customer_name, customer_id, customer_email, customer_phone },
    } = data;

    
    console.log("Cashfree Webhook Data:", req.body);

    
    const order = await Order.findOne({ order_id });

    if (!order) {
      

      return res.status(404).json({ error: "Order not found." });
    }

    
    if (payment_status === "SUCCESS") {
      
      order.order_status = "PAID";  
      order.payment = {
        cf_payment_id,  
        payment_amount, 
        payment_currency, 
        payment_time, 
        customer_name,  
        customer_id,    
        customer_email, 
        customer_phone, 
      };

      
      await order.save();

      
      res.status(200).json({ message: "Payment status updated successfully." });
    } else {
      
      res.status(400).json({ message: "Payment failed." });
    }
  } catch (error) {
    console.error("Error handling payment webhook:", error);
    res.status(500).json({ error: "An error occurred while updating payment status." });
  }
};

module.exports = { createOrder, paymentWebhook };
