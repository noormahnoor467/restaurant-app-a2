require('dotenv').config();
const mongoose = require('mongoose');

const User = mongoose.model(
  'User',
  new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Customer', 'Manager'], default: 'Customer' },
    favourites: { type: [String], default: [] }
  })
);

const users = [
  {
    name: 'Demo Customer',
    email: 'customer@example.com',
    password: 'Password123',
    role: 'Customer',
    favourites: []
  },
  {
    name: 'Demo Manager',
    email: 'manager@example.com',
    password: 'Manager123',
    role: 'Manager',
    favourites: []
  }
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await User.deleteMany({});
    await User.insertMany(users);
    console.log('Users seeded: ' + users.length);
    process.exit();
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });