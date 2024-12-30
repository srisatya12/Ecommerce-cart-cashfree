const Cart = require('../models/cart');
const Product = require('../models/product');


exports.addItemToCart = async (req, res) => {
  const { items } = req.body; 
  const { userId } = req.params;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      const existingItem = cart.items.find(cartItem => cartItem.productId.toString() === item.productId);
      if (existingItem) {
        existingItem.quantity += item.quantity; 
      } else {
        cart.items.push({ productId: item.productId, productName: product.name, quantity: item.quantity });
      }
    }

    let totalAmount = 0;
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      totalAmount += product.price * cartItem.quantity; 
    }

    cart.totalAmount = totalAmount;
    await cart.save();

    res.status(200).json({ message: 'Items added to cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding items to cart' });
  }
};


exports.removeItemFromCart = async (req, res) => {
  const { productId } = req.body;
  const { userId } = req.params;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    
   
    let totalAmount = 0;
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      totalAmount += product.price * cartItem.quantity;
    }

    cart.totalAmount = totalAmount; 
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
};



exports.updateItemQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  const { userId } = req.params;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    item.quantity = quantity;

    
    let totalAmount = 0;
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      totalAmount += product.price * cartItem.quantity;
    }

    cart.totalAmount = totalAmount;
    await cart.save();

    res.status(200).json({ message: 'Item quantity updated', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating item quantity' });
  }
};


exports.getCartDetails = async (req, res) => {

  
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    
    let totalAmount = 0;
    cart.items.forEach(item => {
      totalAmount += item.quantity * item.productId.price; 
    });

    
    const cartWithTotal = {
      ...cart.toObject(),
      totalAmount,
    };

    res.status(200).json({ cart: cartWithTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching cart details' });
  }
};
