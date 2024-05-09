const mongoose = require('mongoose');
const Vehicle = require('./models/vehicle');

mongoose.connect('mongodb://localhost:27017/sarppp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to database');

    const vehicles = [
      { type: 'Car', licensePlate: 'ABC123', cost: 1000, imageUrl: 'https://www.jaipurcitycab.in/images/car2.png' },
      { type: 'Van', licensePlate: 'DEF456', cost: 1000, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8IC3E8o1XzoPzFWZ7m33f8K45fuHusNGg_1xlET0ntA&s' },
      { type: 'Bus', licensePlate: 'GHI789', cost: 1000, imageUrl: 'https://s3-ap-southeast-1.amazonaws.com/rbplus/BusImage/Domestic/18123_190_6.png' },
      // Add more vehicles here
      { type: 'Bus', licensePlate: 'JKL012', cost: 1000, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2023/2/OM/VL/WW/183550597/1860x1050-9400-intercity-coach-bs4-2020.jpg' },
      { type: 'Truck', licensePlate: 'MNO345', cost: 1000, imageUrl: 'https://www.drivespark.com/car-image/340x255x100/car/x1964947-maruti_dzire.jpg.pagespeed.ic.DxcwwuYRIm.jpg' },
      { type: 'Motorcycle', licensePlate: 'PQR678', cost: 1000, imageUrl: 'https://www.topgear.com/sites/default/files/images/news-article/2020/07/87414be99eb3ef0db3c03890a073255a/levc_vn5_003.jpg' }
    ];

    Vehicle.insertMany(vehicles)
      .then(() => console.log('Vehicles inserted'))
      .catch(err => console.error(err))
      .finally(() => mongoose.connection.close());
  })
  .catch(err => console.error('Error connecting to database:', err));
