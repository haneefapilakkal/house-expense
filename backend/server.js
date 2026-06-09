require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const expenseRoutes = require('./routes/expenseRoutes');
const Expense = require('./models/Expense');
const Category = require('./models/Category');
const Source = require('./models/Source');
const User = require('./models/User');
const categoryController = require('./controllers/categoryController');
const userController = require('./controllers/userController');

const categoryRoutes = require('./routes/categoryRoutes');
const sourceRoutes = require('./routes/sourceRoutes');
const userRoutes = require('./routes/userRoutes');

// Define database associations
Expense.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Expense.belongsTo(Source, { foreignKey: 'sourceId', as: 'source' });
Expense.belongsTo(User, { foreignKey: 'userId', as: 'creator' });
Category.hasMany(Expense, { foreignKey: 'categoryId', as: 'expenses' });
Source.hasMany(Expense, { foreignKey: 'sourceId', as: 'expenses' });
User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
sequelize.sync({ alter: true }) // Use alter: true to update schema if needed
  .then(async () => {
    console.log('Database synced & connected...');
    await categoryController.seedCategories();
    await userController.seedUsers();
  })
  .catch(err => console.log('Error: ' + err));

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('House Expense API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
