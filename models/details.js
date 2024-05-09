const mongoose = require('mongoose');

const detailsSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  people: {
    type: Number,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  names: {
    type: [String],
    required: true
  },
  aadharNumbers: {
    type: [String],
    required: true
  }
});

const Details = mongoose.model('Details', detailsSchema);

module.exports = Details;
