require('dotenv').config();
const mongoose = require('mongoose');

const MenuItem = mongoose.model(
  'MenuItem',
  new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    price: Number,
    emoji: String,
    isAvailable: { type: Boolean, default: true },
    isSpecial: { type: Boolean, default: false }
  })
);

const entries = [
  ['Garlic Bread', 'Warm bread with garlic butter and herbs.', 'Starters', 300, '🥖'],
  ['Tomato Soup', 'Slow cooked tomatoes with fresh basil.', 'Starters', 400, '🍅'],
  ['Chicken Wings', 'Six wings with a smoky house glaze.', 'Starters', 650, '🍗'],
  ['Garden Salad', 'Seasonal greens, cucumber and lemon dressing.', 'Starters', 450, '🥗'],
  ['Loaded Fries', 'Crisp fries with cheese and spring onion.', 'Starters', 500, '🍟'],
  ['Grilled Chicken', 'Herb marinated chicken with roasted vegetables.', 'Mains', 1200, '🍗'],
  ['Classic Burger', 'Beef patty, lettuce, tomato and house sauce.', 'Mains', 900, '🍔'],
  ['Margherita Pizza', 'Tomato, mozzarella and basil on a thin crust.', 'Mains', 1100, '🍕'],
  ['Alfredo Pasta', 'Creamy parmesan sauce with fettuccine.', 'Mains', 1000, '🍝'],
  ['Rice Vegetable', 'Fragrant rice with seasonal vegetables.', 'Mains', 750, '🍚'],
  ['Chocolate Brownie', 'Rich chocolate brownie served warm.', 'Desserts', 450, '🍫'],
  ['Cheesecake', 'Creamy vanilla cheesecake with berry topping.', 'Desserts', 550, '🍰'],
  ['Ice Cream', 'Two scoops of vanilla ice cream.', 'Desserts', 300, '🍨'],
  ['Apple Crumble', 'Baked apples with a crunchy oat topping.', 'Desserts', 500, '🥧'],
  ['Pancakes', 'Fluffy pancakes with honey and fresh fruit.', 'Desserts', 600, '🥞'],
  ['Cappuccino', 'Espresso with steamed milk and foam.', 'Drinks', 350, '☕'],
  ['Iced Latte', 'Chilled espresso, milk and ice.', 'Drinks', 400, '🧊'],
  ['Fresh Lemonade', 'Fresh lemon juice with a touch of mint.', 'Drinks', 250, '🍋'],
  ['Mango Smoothie', 'Mango blended with creamy yogurt.', 'Drinks', 450, '🥭'],
  ['Mineral Water', 'A chilled bottle of still water.', 'Drinks', 100, '💧']
];

const items = entries.map(([name, description, category, price, emoji], i) => ({
  name,
  description,
  category,
  price,
  emoji,
  isAvailable: i !== 13,
  isSpecial: [2, 5, 10, 15].includes(i)
}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(items);
    console.log('Menu seeded: ' + items.length + ' items');
    process.exit();
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });