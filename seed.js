require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user.model');

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/demoapp2';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');

  const existing = await User.findOne({ username: 'alice' }).exec();
  if (existing) {
    console.log('Seed user already exists');
    process.exit(0);
  }

  const hashed = await bcrypt.hash('password123', 12);
  const user = new User({ username: 'alice', password: hashed, email: 'alice@example.com', phone: '1234567890', dob: new Date('1990-05-20') });
  await user.save();
  console.log('Created seed user: alice / password123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
