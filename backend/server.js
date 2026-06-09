require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const expenseRoutes = require('./routes/expenseRoutes');
const Expense = require('./models/Expense');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
sequelize.sync({ alter: true }) // Use alter: true to update schema if needed
  .then(() => console.log('Database synced & connected...'))
  .catch(err => console.log('Error: ' + err));

// Routes
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
  res.send('House Expense API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
