require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'GTA V — Steam Key',
    description: 'Grand Theft Auto V. Explore the sprawling open world of Los Santos in this epic action-adventure. Full game access including online mode.',
    price: 499,
    originalPrice: 1499,
    category: 'steam',
    platform: 'PC (Steam)',
    badge: 'SALE',
    stock: 10
  },
  {
    name: 'Red Dead Redemption 2',
    description: 'An epic tale of life in America at the dawn of the modern age. Steam key, instant delivery upon purchase.',
    price: 799,
    originalPrice: 2099,
    category: 'steam',
    platform: 'PC (Steam)',
    badge: 'HOT',
    stock: 5
  },
  {
    name: 'Cyberpunk 2077 — Full Account',
    description: 'Premium GOG account with Cyberpunk 2077 + Phantom Liberty DLC pre-installed. Full ownership transfer.',
    price: 699,
    originalPrice: 1799,
    category: 'account',
    platform: 'PC (GOG)',
    badge: 'NEW',
    stock: 3
  },
  {
    name: 'Minecraft Java Edition',
    description: 'Official Minecraft Java Edition account. Play on any server, full modding support. Permanent ownership.',
    price: 999,
    originalPrice: 1999,
    category: 'account',
    platform: 'PC (Java)',
    badge: 'HOT',
    stock: 8
  },
  {
    name: 'Steam Wallet ₹500',
    description: 'Add ₹500 to your Steam Wallet instantly. Works on any Steam account worldwide.',
    price: 449,
    category: 'giftcard',
    platform: 'Steam',
    badge: 'NEW',
    stock: 20
  },
  {
    name: 'Elden Ring — Steam Key',
    description: 'FromSoftware\'s masterpiece. Journey through the Lands Between in this critically acclaimed action RPG.',
    price: 1299,
    originalPrice: 2999,
    category: 'steam',
    platform: 'PC (Steam)',
    stock: 4
  },
  {
    name: 'EA Play Pro Account',
    description: 'EA Play Pro subscription account with access to 100+ EA games including FIFA, Battlefield, and more.',
    price: 399,
    originalPrice: 899,
    category: 'account',
    platform: 'PC (EA App)',
    badge: 'SALE',
    stock: 7
  },
  {
    name: 'Xbox Game Pass Ultimate — 1 Month',
    description: 'Xbox Game Pass Ultimate code for 1 month. Access 100+ games including Day 1 releases.',
    price: 349,
    originalPrice: 699,
    category: 'giftcard',
    platform: 'Xbox / PC',
    stock: 15
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamesz');
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log('✅ Database seeded with', sampleProducts.length, 'products');
  mongoose.disconnect();
}

seed().catch(console.error);
