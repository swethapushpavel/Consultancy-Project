const mongoose = require('mongoose');

const Payment = mongoose.model('Payment', {
  username: String,
  email: String,
  package: String,
  cost: Number,
  cardNumber: String,
  cardName: String,
  expiryDate: String,
  cvv: String,
  startDate: Date,
  vehicleType: String,
  vehicleLicensePlate: String,
  vehicleId: String,
  vehicleDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }, // Reference to the Vehicle model
});

module.exports = Payment;
