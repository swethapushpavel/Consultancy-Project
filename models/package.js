const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  
  name: String,
  description: String,
  days: String,
  nights: Number,
  maxCapacity: Number,
  places: String,
  imageUrl: String,
  cost: Number,
  vehicleType: String,
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
