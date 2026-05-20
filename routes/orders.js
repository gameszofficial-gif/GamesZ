const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Screenshot upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/uploads/screenshots');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `ss_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// Step 1: Customer clicks Buy — create pending order, redirect to UPI payment page
router.post('/initiate', requireAuth, async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product || product.stock < 1) {
      return res.json({ success: false, message: 'Product out of stock' });
    }
    const roomId = uuidv4();
    const order = new Order({
      user: req.session.userId,
      product: product._id,
      productName: product.name,
      amount: product.price,
      status: 'awaiting_payment',
      chatRoomId: roomId
    });
    await order.save();
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Could not create order' });
  }
});

// Step 2: UPI payment page (shows QR + UPI ID + upload form)
router.get('/pay/:orderId', requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.session.userId }).populate('product');
    if (!order) return res.redirect('/');
    if (order.status === 'paid' || order.status === 'delivered') {
      return res.redirect(`/orders/chat/${order.chatRoomId}`);
    }
    res.render('upi-payment', {
      order,
      user: { username: req.session.username },
      upiId: process.env.UPI_ID || 'yourname@upi',
      upiName: process.env.UPI_NAME || 'Gamesz Store'
    });
  } catch (err) {
    res.redirect('/');
  }
});

// Step 3: Customer submits screenshot + transaction ID
router.post('/submit-proof/:orderId', requireAuth, upload.single('screenshot'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.session.userId });
    if (!order) return res.redirect('/');

    const { transactionId } = req.body;
    const screenshotPath = req.file ? `/uploads/screenshots/${req.file.filename}` : null;

    await Order.findByIdAndUpdate(order._id, {
      upiTransactionId: transactionId || '',
      screenshotPath,
      status: 'payment_submitted'
    });

    res.redirect(`/orders/pending/${order._id}`);
  } catch (err) {
    console.error(err);
    res.redirect(`/orders/pay/${req.params.orderId}?error=upload_failed`);
  }
});

// Step 4: Pending confirmation page (customer waits for admin to approve)
router.get('/pending/:orderId', requireAuth, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.session.userId });
  if (!order) return res.redirect('/');
  // If already approved, go straight to chat
  if (order.status === 'paid' || order.status === 'delivered') {
    return res.redirect(`/orders/chat/${order.chatRoomId}`);
  }
  res.render('pending', { order, user: { username: req.session.username } });
});

// Polling endpoint — customer page checks this every 5s
router.get('/check-status/:orderId', requireAuth, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.session.userId });
  if (!order) return res.json({ status: 'not_found' });
  res.json({ status: order.status, chatRoomId: order.chatRoomId });
});

// Chat page (only accessible after admin approves payment)
router.get('/chat/:roomId', requireAuth, async (req, res) => {
  const order = await Order.findOne({ chatRoomId: req.params.roomId, user: req.session.userId });
  if (!order) return res.redirect('/');
  if (order.status === 'awaiting_payment' || order.status === 'payment_submitted') {
    return res.redirect(`/orders/pending/${order._id}`);
  }
  res.render('chat', {
    order,
    roomId: req.params.roomId,
    user: { username: req.session.username }
  });
});

module.exports = router;
