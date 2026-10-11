require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Models ----------
const MenuItem = mongoose.model(
  'MenuItem',
  new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    category: String,
    price: Number,
    emoji: String,
    isAvailable: { type: Boolean, default: true },
    isSpecial: { type: Boolean, default: false }
  })
);

const User = mongoose.model(
  'User',
  new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' }, 
    favourites: {type:[String], default: []}
  })
);

const Reservation = mongoose.model(
  'Reservation',
  new mongoose.Schema(
    {
      userId: String,
      status: { type: String, default: 'Pending' }
    },
    { strict: false, timestamps: true }
  )
);

const Order = mongoose.model(
  'Order',
  new mongoose.Schema(
    {
      userId: String,
      status: { type: String, default: 'Pending' }
    },
    { strict: false, timestamps: true }
  )
);

// ---------- Helper ----------
const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

app.get('/', (req, res) => res.send('Restaurant Server is running!'));

// ---------- Menu ----------
app.get('/api/menu', wrap(async (req, res) => res.json(await MenuItem.find())));
app.post('/api/menu', wrap(async (req, res) => res.status(201).json(await MenuItem.create(req.body))));
app.put('/api/menu/:id', wrap(async (req, res) =>
  res.json(await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true }))
));
app.delete('/api/menu/:id', wrap(async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

// ---------- Users ----------
app.post('/api/users/register', wrap(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
}));
app.post('/api/users/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  res.json(user);
}));
app.get('/api/users', wrap(async (req, res) => res.json(await User.find())));

// ---------- Reservations ----------
app.get('/api/reservations', wrap(async (req, res) => {
  const filter = req.query.userId ? { userId: req.query.userId } : {};
  res.json(await Reservation.find(filter));
}));
app.post('/api/reservations', wrap(async (req, res) =>
  res.status(201).json(await Reservation.create(req.body))
));
app.put('/api/reservations/:id', wrap(async (req, res) =>
  res.json(await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true }))
));
app.delete('/api/reservations/:id', wrap(async (req, res) => {
  await Reservation.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

// ---------- Orders ----------
app.get('/api/orders', wrap(async (req, res) => {
  const filter = req.query.userId ? { userId: req.query.userId } : {};
  res.json(await Order.find(filter).sort({ createdAt: -1 }));
}));
app.post('/api/orders', wrap(async (req, res) =>
  res.status(201).json(await Order.create(req.body))
));
app.put('/api/orders/:id', wrap(async (req, res) =>
  res.json(await Order.findByIdAndUpdate(req.params.id, req.body, { new: true }))
));
app.delete('/api/orders/:id', wrap(async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

// ---------- Start ----------
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
  });