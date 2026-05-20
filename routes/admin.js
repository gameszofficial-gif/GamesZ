const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/images/games');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Admin login
router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === (process.env.ADMIN_USERNAME || 'admin') &&
      password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    req.session.isAdmin = true;
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: 'Invalid credentials' });
});

router.get('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

// Dashboard
router.get('/dashboard', requireAdmin, async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const recentOrders = await Order.find().populate('user product').sort({ createdAt: -1 }).limit(10);
  const revenue = await Order.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  res.render('admin/dashboard', {
    stats: {
      products: totalProducts,
      orders: totalOrders,
      users: totalUsers,
      revenue: revenue[0]?.total || 0
    },
    recentOrders
  });
});

// Products list
router.get('/products', requireAdmin, async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.render('admin/products', { products });
});

// Add product form
router.get('/products/new', requireAdmin, (req, res) => {
  res.render('admin/product-form', { product: null, error: null });
});

// Add product POST
router.post('/products/new', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, platform, badge, stock } = req.body;
    const image = req.file ? `/images/games/${req.file.filename}` : '/images/default-game.png';
    const product = new Product({ name, description, price, originalPrice, category, platform, image, badge, stock, isActive: true });
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    res.render('admin/product-form', { product: null, error: 'Failed to add product' });
  }
});

// Edit product form
router.get('/products/edit/:id', requireAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('admin/product-form', { product, error: null });
});

// Edit product POST
router.post('/products/edit/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, platform, badge, stock, isActive } = req.body;
    const update = { name, description, price, originalPrice, category, platform, badge, stock, isActive: isActive === 'on' };
    if (req.file) update.image = `/images/games/${req.file.filename}`;
    await Product.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/products');
  } catch (err) {
    res.redirect('/admin/products');
  }
});

// Delete product
router.post('/products/delete/:id', requireAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/admin/products');
});

// Orders
router.get('/orders', requireAdmin, async (req, res) => {
  const orders = await Order.find().populate('user product').sort({ createdAt: -1 });
  res.render('admin/orders', { orders });
});

// Update order status
router.post('/orders/status/:id', requireAdmin, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.redirect('/admin/orders');
});

// Admin chat panel
router.get('/chat', requireAdmin, (req, res) => {
  res.render('admin/chat');
});

module.exports = router;
