const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const User = require('./models/user');
const Package = require('./models/package');
const Payment = require('./models/payment');
const Admin = require('./models/admin');
const multer = require('multer');
const Details = require('./models/details');
const Vehicle = require('./models/vehicle');
const Places = require('./models/places');
// Adjust the path as per your directory structure
// Assuming you have a Booking model defined using Mongoose
const Booking = require('./models/booking');

mongoose.connect('mongodb://localhost:27017/sarppp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Assuming you have a Package model defined using Mongoose

async function getPackageById(packageId) {
try {
  const package = await Package.findById(packageId);
  return package;
} catch (error) {
  console.error(error);
  throw new Error('Failed to get package by ID');
}
}
// Assuming you have a Places model defined using Mongoose
async function getPlaces() {
try {
  const places = await Places.find({});
  return places;
} catch (error) {
  console.error(error);
  throw new Error('Failed to get places');
}
}

// Socket.io logic for real-time tracking
let currentLocation = { latitude: 11.341036, longitude: 77.717166 };
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('locationUpdate', currentLocation);
  setInterval(() => {
    currentLocation = simulateNextLocation(currentLocation);
    socket.emit('locationUpdate', currentLocation);
  }, 5000);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

function simulateNextLocation(currentLocation) {
  return {
    latitude: currentLocation.latitude + 0.001,
    longitude: currentLocation.longitude + 0.001,
  };
}

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'swethapushpavelv@gmail.com',
    pass: 'mefp mimd fnew hkyx',
  },
});


// Routes for user authentication

app.get('/', (req, res) => {
  res.render('frontend/tourly/login');
});

app.get('/register', (req, res) => {
  res.render('frontend/tourly/register');
});

app.post('/register', async (req, res) => {
  const { username, email, password, phoneNumber, address } = req.body;
  const user = new User({ username, email, password, phoneNumber, address });
  await user.save();
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('frontend/tourly/login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) {
    res.redirect('/login');
  } else {
    req.session.user = user;
    res.redirect('/packages');
  }
});

// Route to display packages for the user
// Route to display packages for the user
app.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find({});
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      res.render('frontend/tourly/index', { user: req.session.user, packages });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
});
app.get('/payment', async (req, res) => {
  try {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      const { packageId, packageCost, days, vehicleType, startDate, people } = req.query;

      // Fetch the selected vehicle based on the vehicleType
      const selectedVehicle = await Vehicle.findOne({ type: vehicleType });
      if (!selectedVehicle) {
        throw new Error('Selected vehicle not found');
      }

      // Fetch the selected package based on the packageId
      const selectedPackage = await Package.findById(packageId);
      if (!selectedPackage) {
        throw new Error('Selected package not found');
      }

      // Calculate the total cost
      const totalCost = parseFloat(packageCost) + parseFloat(selectedVehicle.cost);

      res.render('frontend/tourly/payment', {
        package: selectedPackage.name,
        packageCost,
        people,
        days,
        places: selectedPackage.places,
        vehicleType,
        vehicleCost: selectedVehicle.cost,
        vehicleDetails: selectedVehicle.details,
        licensePlate: selectedVehicle.licensePlate,
        cost: totalCost,
        user: req.session.user,
        startDate: startDate, // Pass the start date to the payment page
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
});

app.post('/confirm-payment', async (req, res) => {
  try {
    // Check if payment has already been processed
    if (req.session.paymentProcessed) {
      return res.redirect('/success'); // Redirect to success page if payment has already been processed
    }

    const { package, cost, cardNumber, cardName, expiryDate, cvv, days, startDate, vehicleType, licensePlate, people } = req.body;

    // Validate the start date format (you can add more validation logic here)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return res.status(400).send('Invalid start date format');
    }

    // Extract the numeric value from the cost string (e.g., "INR 1,14,399" -> 114399)
    const numericCost = parseFloat(cost.replace(/[^\d.]/g, ''));

    // Save payment details to the database
    const payment = new Payment({
      username: req.session.user.username,
      email: req.session.user.email,
      package: package,
      cost: numericCost,
      cardNumber: cardNumber,
      cardName: cardName,
      expiryDate: expiryDate,
      cvv: cvv,
      startDate: startDate, // Store the start date in the payments database
    });
    await payment.save();

    // Set session flag to indicate payment has been processed
    req.session.paymentProcessed = true;

    // Find the package ObjectId based on the package name
    const selectedPackage = await Package.findOne({ name: package });
    if (!selectedPackage) {
      throw new Error('Selected package not found');
    }

    // Send email
    const mailOptions = {
      from: 'swethapushpavelv@gmail.com',
      to: req.session.user.email,
      subject: 'Payment Confirmation',
      html: `<p>Dear ${req.session.user.username},</p>
              <p>Your payment of INR ${cost} for package "${package}" starting on ${startDate} has been confirmed.</p>
              <p>Thank you for choosing our service.
              - SARP travels</p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(500).send('Failed to send confirmation email.');
      } else {
        console.log('Email sent: ' + info.response);
        res.redirect('/success'); // Redirect to success page
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Routes for admin panel

app.get('/admin/login', (req, res) => {
  res.render('frontend/tourly/admin_login');
});

app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email, password });
  if (!admin) {
    res.redirect('/admin/login');
  } else {
    req.session.admin = admin;
    res.redirect('/admin/dashboard');
  }
});

// Update existing package
// Update existing package
// Assuming you are using Express and Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Update package image route
// Update existing package
app.post('/admin/packages/:id', upload.single('image'), async (req, res) => {
try {
  const packageId = req.params.id;
  const { name, days, cost, places, description } = req.body;
  const imageUrl = req.file ? '/uploads/' + req.file.filename : undefined; // Image URL

  // Update package document in the database with new details
  await Package.findByIdAndUpdate(packageId, { name, days, cost, places, description, imageUrl });

  // Redirect to admin dashboard or send a success response
  res.redirect('/admin/dashboard');
} catch (error) {
  // Handle error
  res.status(500).send('Internal Server Error');
}
});

app.post('/admin/packages', upload.single('image'), async (req, res) => {
try {
  const { name, days, cost, places, description } = req.body;
  const imageUrl = req.file ? '/uploads/' + req.file.filename : undefined; // Image URL
  const newPackage = new Package({ name, days, cost, places, description, imageUrl });
  await newPackage.save();
  res.redirect('/admin/dashboard');
} catch (err) {
  console.error(err);
  res.status(500).send('Internal Server Error: ' + err.message);
}
});


// app.get('/admin/dashboard', async (req, res) => {
//   try {
//     const packages = await Package.find({});  
//     const admin = await Admin.findById(req.session.admin._id); // Assuming you have stored the admin ID in the session
//     res.render('frontend/tourly/admin_dashboard', { packages, admin: req.session.admin, adminName: admin.name });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error: ' + err.message);
//   }
// });
// Route to render admin dashboard
app.get('/admin/dashboard', async (req, res) => {
try {
  const packages = await Package.find({});
  res.render('frontend/tourly/admin_dashboard', { packages, admin: req.session.admin, adminName: req.session.admin.username });
} catch (err) {
  console.error(err);
  res.status(500).send('Internal Server Error: ' + err.message);
}
});

// Route for admin signup form
app.get('/admin/signup', (req, res) => {
res.render('frontend/tourly/admin_signup');
});

// Route for handling admin signup form submission
app.post('/admin/signup', async (req, res) => {
const { username, email, password } = req.body;
const admin = new Admin({ username, email, password });
await admin.save();
res.redirect('/admin/login');
});

app.get('/admin/packages/add', (req, res) => {
res.render('frontend/tourly/admin_add_package');
});

  // Route for admin signup form
  app.get('/admin/users', async (req, res) => {
    try {
      const users = await User.find({});
      res.render('frontend/tourly/admin_user', { users, admin: req.session.admin });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error: ' + err.message);
    }
  });
  

// Route for handling admin signup form submission
app.get('/admin/bookings', async (req, res) => {
try {
  const bookings = await Payment.find({});
  res.render('frontend/tourly/admin_bookings', { bookings, admin: req.session.admin });
} catch (err) {
  console.error(err);
  res.status(500).send('Internal Server Error: ' + err.message);
}
});
// Route to render the admin vehicles page
app.get('/admin/vehicles', async (req, res) => {
try {
  const vehicles = await Vehicle.find({});
  res.render('frontend/tourly/admin_vehicles', { vehicles, admin: req.session.admin });
} catch (err) {
  console.error(err);
  res.status(500).send('Internal Server Error: ' + err.message);
}
});

// Route to handle form submission for adding a new vehicle
app.get('/admin/vehicles/add', async (req, res) => {
  try {
    res.render('frontend/tourly/admin_add_vehicle');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
});

// Route to render the update form for a specific vehicle
app.get('/admin/vehicles/edit/:id', async (req, res) => {
try {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    res.status(404).send('Vehicle not found');
  } else {
    res.render('frontend/tourly/admin_edit_vehicle', { vehicle });
  }
} catch (err) {
  console.error(err);
  res.status(500).send('Internal Server Error: ' + err.message);
}
});


// Route to handle form submission for updating a vehicle
// Route to handle form submission for updating a vehicle
// Route to handle updating a specific vehicle
app.post('/admin/vehicles/:id', async (req, res) => {
try {
  const vehicleId = req.params.id;
  const { type, licensePlate, cost, imageUrl } = req.body;
  
  // Update the vehicle document in the database with new details
  await Vehicle.findByIdAndUpdate(vehicleId, { type, licensePlate, cost, imageUrl });
  
  // Redirect to the admin vehicles page or send a success response
  res.redirect('/admin/vehicles');
} catch (error) {
  // Handle error
  res.status(500).send('Internal Server Error');
}
});

// Route to handle deleting a vehicle
app.post('/admin/vehicles/delete/:id', async (req, res) => {
try {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.redirect('/admin/vehicles');
} catch (err) {
  console.error(err);
  res.status(500).send('Internal Server Error: ' + err.message);
}
});

app.get('/success', (req, res) => {
res.render('frontend/tourly/success', { user: req.session.user });
});
// Update the route to render the vehicle display page
// Route to get details of a specific package
app.get('/details/:id', async (req, res) => {
try {
  const packageId = req.params.id;
  const package = await getPackageById(packageId);
  if (!package) {
    res.status(404).send('Package not found');
  } else {
    res.render('frontend/tourly/details', { package, packageId }); // Pass packageId to the template
  }
} catch (err) {
  console.error(err);
  res.status(500).send('Internal Server Error: ' + err.message);
}
});

// Handle vehicle selection and redirect to payment page
// Route to handle vehicle selection
app.post('/details/:packageId/confirm', async (req, res) => {
try {
  const { vehicleId, startDate, people, days } = req.body;
  const package = await Package.findById(req.params.packageId);
  const vehicle = await Vehicle.findById(vehicleId);

  // Pass the package cost as a query parameter to the payment page
  res.redirect(`/payment?packageId=${req.params.packageId}&packageCost=${package.cost}&days=${days}&vehicleType=${vehicle.type}&startDate=${startDate}&people=${people}`);

} catch (err) {
  console.error(err);
  res.status(500).send('Internal Server Error');
}
});
app.post('/details/:id/select-vehicle', async (req, res) => {
try {
  const packageId = req.params.id;
  const package = await getPackageById(packageId);
  const { startDate, people, days } = req.body;

  // Find all vehicles
  const allVehicles = await Vehicle.find({});

  // Find vehicles that are not booked for the same start date
  const bookedVehicles = await Booking.find({ startDate });
  const bookedVehicleIds = bookedVehicles.map(vehicle => vehicle.vehicleId);

  // Filter out the vehicles that are not booked for the same start date
  const availableVehicles = allVehicles.filter(vehicle => !bookedVehicleIds.includes(vehicle._id.toString()));

  console.log('Available vehicles:', availableVehicles);

  res.render('frontend/tourly/vehicle', {
    packageId,
    startDate,
    package,
    availableVehicles,
    people,
    days,
    user: req.session.user
  });
} catch (err) {
  console.error('Error selecting vehicle:', err);
  res.status(500).send('Internal Server Error');
}
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});


