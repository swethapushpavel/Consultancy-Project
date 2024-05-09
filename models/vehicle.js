const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  type: { type: String, required: true },
  licensePlate: { type: String, required: true },
  startDates: [{ type: Date }], // Array to store booked start dates
  cost: Number,
  imageUrl: { type: String } // Add imageUrl field for storing image URLs
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
