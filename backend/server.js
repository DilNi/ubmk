const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');


const adminRoutes = require('./routes/adminRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();
app.use(express.json());



app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use('/api/admin', adminRoutes);


app.use('/api/sessions', sessionRoutes);


const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use(cors());


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
