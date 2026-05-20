const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: {
    type: String,
    enum: ['steam', 'account', 'giftcard', 'other'],
    default: 'steam'
  },
  platform: { type: String, default: 'PC' },
  image: { type: String, default: '/images/default-game.png' },
  badge: { type: String }, // e.g. "HOT", "NEW", "SALE"
  stock: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
