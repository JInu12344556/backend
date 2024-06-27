// routes/userroutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming a User model

router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body); // Create a new User object from request body
    const savedUser = await newUser.save(); // Save the user to the database
    res.json(savedUser); // Send the saved user back as a response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
});

module.exports = router;
