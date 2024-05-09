// populate-vehicles.js
const mongoose = require('mongoose');
const Vehicle = require('./models/vehicle');

mongoose.connect('mongodb://localhost:27017/sarppp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const vehicles = [
  { image: 'url(https://media.zigcdn.com/media/content/2023/Jun/cover_64897fbf7bc74.jpg)', type: 'bus', seaterNumber: 50 },
  { image: '/path/to/car.jpg', type: 'car', seaterNumber: 5 },
  { image: '/path/to/van.jpg', type: 'van', seaterNumber: 10 }
];

Vehicle.insertMany(vehicles)
  .then(() => {
    console.log('Vehicles added successfully');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error adding vehicles:', err);
    mongoose.connection.close();
  });
