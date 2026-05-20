const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

// Home / Store Page
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query).sort({ createdAt: -1 });
    const featuredProducts = await Product.find({ isActive: true, badge: { $exists: true, $ne: '' } }).limit(4);

    res.render('store', {
      products,
      featuredProducts,
      user: req.session.userId ? { username: req.session.username } : null,
      category: category || 'all',
      search: search || ''
    });
  } catch (err) {
    console.error(err);
    res.render('store', { products: [], featuredProducts: [], user: null, category: 'all', search: '' });
  }
});

// Product Detail
router.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect('/');
    res.render('product', {
      product,
      user: req.session.userId ? { username: req.session.username } : null
    });
  } catch (err) {
    res.redirect('/');
  }
});

// Dashboard (after login)
router.get('/dashboard', requireAuth, async (req, res) => {
  const Order = require('../models/Order');
  const orders = await Order.find({ user: req.session.userId }).populate('product').sort({ createdAt: -1 });
  res.render('dashboard', {
    user: { username: req.session.username, email: req.session.email },
    orders
  });
});

module.exports = router;
