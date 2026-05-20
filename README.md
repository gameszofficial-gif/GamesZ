# 🎮 Gamesz — Premium Game Store (UPI Payments)

Dark navy themed game store with UPI payment flow, live chat, and admin panel.

## Tech Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Real-time Chat**: Socket.IO
- **Payments**: Direct UPI (no merchant account needed!)
- **Views**: EJS templating
- **Deployment**: Vercel

---

## 🚀 Local Setup

### 1. Install
```bash
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gamesz
SESSION_SECRET=some_random_long_string
UPI_ID=yourname@okicici        ← YOUR UPI ID (GPay, PhonePe, Paytm etc.)
UPI_NAME=Gamesz Store          ← Your name shown during payment
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 3. Seed Sample Products
```bash
node seed.js
```

### 4. Run
```bash
npm start
# → http://localhost:3000
# → http://localhost:3000/admin/login
```

---

## 💸 UPI Payment Flow

```
Customer clicks Buy Now
       ↓
Order created (status: awaiting_payment)
       ↓
UPI Payment Page shown:
  • Your UPI ID (with copy button)
  • QR code (auto-generated)
  • "Open in UPI App" deep link
  • Amount to pay clearly shown
       ↓
Customer pays via GPay / PhonePe / Paytm / BHIM
       ↓
Customer uploads payment screenshot + optional UTR number
       ↓
Pending page (auto-polls every 5 seconds)
       ↓
YOU: Go to /admin/orders → see screenshot → click "Approve"
       ↓
Chat room opens — you send game credentials
       ↓
Order marked as Delivered ✅
```

---

## 🔑 Key URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Store |
| `http://localhost:3000/admin/login` | Admin login |
| `http://localhost:3000/admin/orders` | **Review UPI payments here** |
| `http://localhost:3000/admin/chat` | Live chat panel |
| `http://localhost:3000/admin/products/new` | Add new product |

---

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import to vercel.com
3. Set Environment Variables in Vercel dashboard
4. For MongoDB: use MongoDB Atlas (free tier)

---

## 📁 Project Structure
```
gamesz/
├── server.js              # Server + Socket.IO chat
├── seed.js                # Sample product data
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Order.js           # UPI transaction fields
├── routes/
│   ├── store.js
│   ├── auth.js
│   ├── orders.js          # UPI flow + screenshot upload
│   └── admin.js
├── views/
│   ├── store.ejs
│   ├── product.ejs        # Buy Now button
│   ├── upi-payment.ejs    # UPI QR + upload page
│   ├── pending.ejs        # Waiting for approval
│   ├── chat.ejs           # Post-approval chat
│   ├── auth.ejs
│   ├── dashboard.ejs
│   └── admin/
│       ├── orders.ejs     # Screenshot review + approve/reject
│       ├── chat.ejs       # Admin chat panel
│       └── ...
└── public/
    ├── css/
    ├── images/
    └── uploads/screenshots/  ← payment screenshots stored here
```
