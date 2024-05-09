const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  vehicleType: {
    type: String,
    required: true,
  },
  vehicleLicensePlate: {
    type: String,
    required: true,
  },
  people: {
    type: Number,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
