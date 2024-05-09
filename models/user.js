const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  phoneNumber: String, // Define phoneNumber field
  address: String, // Define address field
});

const User = mongoose.model('User', userSchema);

module.exports = User;

