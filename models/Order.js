const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  amount: { type: Number, required: true },
  upiTransactionId: { type: String },       // customer enters their UTR/transaction ID
  screenshotPath: { type: String },          // uploaded payment screenshot
  status: {
    type: String,
    enum: ['awaiting_payment', 'payment_submitted', 'paid', 'delivered', 'cancelled'],
    default: 'awaiting_payment'
  },
  chatRoomId: { type: String },
  adminNote: { type: String },              // internal note, never shown to customer
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
