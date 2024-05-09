const mongoose = require('mongoose');
const Package = require('./models/package');

mongoose.connect('mongodb://localhost:27017/sarppp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const packages = [
  {
    name: 'Magnificent Ooty',
    description: 'Places to be visited - Botanical garden, pykara falls, pykara lake, doddabetta Peak, Avalanche lake, Ooty resort, Emarald Lake, Government Rose garden. Vehicle type: BUS',
    days: 4,
    nights: 3,
    maxCapacity: 10,
    places: 'OOTY',
    imageUrl: '../images/india-ooty-indian-railways-hill-station.jpg',
    cost: 34650,
  },
  {
    name: 'Dazzling Yercaud',
    description: 'Places to be visited - 32-km Loop Road, Peeku Park, Shevaroy Temple, Big Lake, Pagoda Point, Karadiyur View Point, Boatnical Garden. Vehicle Type: 6 seater van',
    days: 3,
    nights: 4,
    maxCapacity: 6,
    places: 'Yercaud',
    imageUrl: '../images/Yercaud-Tamil-Nadu (1).jpg',
    cost: 32154,
  },
  {
    name: 'Short Getaway to Rameshwaram, Madurai & Kanyakumari',
    description: 'Places to be visited - Siteseeing in madhurai, Madurai Residency, Siteseeing in Rameshwaram, Siteseeing in kanyakumari. Vehicle Type: Car',
    days: 4,
    nights: 3,
    maxCapacity: 4,
    places: 'Rameshwaram-Madhurai-Kanyakumari',
    imageUrl: '../images/mysore.jpg',
    cost: 32771,
  },
];

Package.insertMany(packages)
  .then(() => {
    console.log('Packages inserted successfully');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Error inserting packages:', err);
    mongoose.connection.close();
  });
