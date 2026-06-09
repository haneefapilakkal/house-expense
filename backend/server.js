require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const Expense  = require('./models/Expense');
const Category = require('./models/Category');
const Source   = require('./models/Source');
const User     = require('./models/User');

const { verifyToken } = require('./middleware/auth');
const authRoutes     = require('./routes/authRoutes');
const expenseRoutes  = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const sourceRoutes   = require('./routes/sourceRoutes');
const userRoutes     = require('./routes/userRoutes');

const categoryController = require('./controllers/categoryController');
const userController     = require('./controllers/userController');

// Database associations
Expense.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Expense.belongsTo(Source,   { foreignKey: 'sourceId',   as: 'source'   });
Expense.belongsTo(User,     { foreignKey: 'userId',     as: 'creator'  });
Category.hasMany(Expense, { foreignKey: 'categoryId', as: 'expenses' });
Source.hasMany(Expense,   { foreignKey: 'sourceId',   as: 'expenses' });
User.hasMany(Expense,     { foreignKey: 'userId',     as: 'expenses' });

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Public routes (no token needed) ─────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Protected routes (token required) ───────────────────────────────────────
app.use('/api/expenses',   verifyToken, expenseRoutes);
app.use('/api/categories', verifyToken, categoryRoutes);
app.use('/api/sources',    verifyToken, sourceRoutes);
app.use('/api/users',      userRoutes);   // has own per-route guards

app.get('/', (req, res) => res.send('House Expense API is running...'));

// Sync DB and seed
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database synced & connected...');
    await categoryController.seedCategories();
    await userController.seedUsers();
  })
  .catch(err => console.error('DB Error:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
