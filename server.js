import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import otpGenerator from 'otp-generator';
import pkg from 'twilio';

const { Twilio } = pkg;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      family: 4, // Use IPv4, skip trying IPv6
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};
connectDB();

// Define schema and model for users
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Helper function to authenticate user
const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email, password });
  return user;
};

// Route to register a new user
app.post('/register', async (req, res) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const user = await newUser.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to authenticate a user and login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authenticateUser(email, password);
    if (user) {
      res.json({ username: user.name });
    } else {
      res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Twilio client for OTP generation
const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Route to send OTP via Twilio
app.post('/api/send-otp', async (req, res) => {
  const { mobileNumber } = req.body;
  const otp = otpGenerator.generate(4, { digits: true, alphabets: false, upperCase: false, specialChars: false });

  try {
    await twilioClient.messages.create({
      body: `Your OTP is ${otp}`, // Use backticks for template literals
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber,
    });
    res.send({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to send OTP', error });
  }
});

// Define schema and model for reviews
const reviewSchema = new mongoose.Schema({
  id: Number,
  name: String,
  title: String,
  content: String,
  rating: Number,
});

const Review = mongoose.model('Review', reviewSchema);

// Route to fetch reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route to post a new review
app.post('/api/reviews', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Define schema and model for amenities
const amenitySchema = new mongoose.Schema({
  location: String,
  amenities: [String],
});

const Amenity = mongoose.model('Amenity', amenitySchema);

// Route to fetch amenities based on location using GET
app.get('/api/amenities', async (req, res) => {
  const location = req.query.location;
  try {
    const amenities = await Amenity.findOne({ location });
    if (amenities) {
      res.json({ amenities: amenities.amenities });
    } else {
      res.status(404).json({ message: 'Amenities not found for the specified location' });
    }
  } catch (error) {
    console.error('Error fetching amenities:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to fetch amenities based on location using POST
app.post('/api/amenities', (req, res) => {
  const { location } = req.body;
  // Logic to fetch amenities based on location
  const amenities = [`'amenties',${Booking.location}`]; // Example amenities
  res.json({ amenities });
});

// Define schema and model for booking confirmation
const bookingConfirmationSchema = new mongoose.Schema({
  userName: String,
  hotelName: String,
  paymentStatus: String,
});

const BookingConfirmation = mongoose.model('BookingConfirmation', bookingConfirmationSchema);

// Endpoint to post booking confirmation
app.post('/api/bookings/confirmation', async (req, res) => {
  const { userName, hotelName, paymentStatus } = req.body;

  if (!userName || !hotelName || !paymentStatus) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newBookingConfirmation = new BookingConfirmation({
      userName,
      hotelName,
      paymentStatus,
    });

    await newBookingConfirmation.save();
    res.status(201).json({ message: 'Booking confirmation saved successfully', newBookingConfirmation });
  } catch (err) {
    console.error('Error saving booking confirmation:', err);
    res.status(500).json({ message: 'Failed to save booking confirmation' });
  }
});

// Endpoint to get booking details
app.get('/api/bookings/details', async (req, res) => {
  try {
    const bookingDetails = await BookingConfirmation.find();
    res.status(200).json(bookingDetails);
  } catch (err) {
    console.error('Error fetching booking details:', err);
    res.status(500).json({ message: 'Failed to fetch booking details' });
  }
});

// Define schema and model for payment receipt
const paymentReceiptSchema = new mongoose.Schema({
  username: String,
  hotelName: String,
  price: String,
  paymentStatus: String,
  checkInDate: Date,
  checkOutDate: Date,
});

const PaymentReceipt = mongoose.model('PaymentReceipt', paymentReceiptSchema);

// Define the POST route to handle payment receipt submissions
app.post('/api/bookings', async (req, res) => {
  const { username, hotelName, price, paymentStatus, checkInDate, checkOutDate } = req.body;

  try {
    const newPaymentReceipt = new PaymentReceipt({
      username,
      hotelName,
      price,
      paymentStatus,
      checkInDate: new Date(checkInDate), // Ensure these are Date objects
      checkOutDate: new Date(checkOutDate), // Ensure these are Date objects
    });

    const savedPaymentReceipt = await newPaymentReceipt.save();
    res.status(200).json(savedPaymentReceipt);
  } catch (error) {
    console.error('Error saving payment receipt:', error);
    res.status(500).json({ message: 'Failed to save payment receipt' });
  }
});


// Define schema and model for logs
const logSchema = new mongoose.Schema({
  userId: String,
  username: String,
  action: String,
  timestamp: { type: Date, default: Date.now },
  bookingDetails: String,
});

const Log = mongoose.model('Log', logSchema);

async function getBookingLogs(userId, retries = 3, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const logs = await Log.find({
        $or: [
          { action: 'login' },
          { action: 'booking_confirmation' },
        ],
        userId: userId,
      }).sort({ timestamp: -1 });

      console.log('Booking Logs:', logs);
      return logs;
    } catch (error) {
      console.error(`Error fetching logs (attempt ${i + 1}):`, error);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error('Failed to fetch logs after multiple attempts');
      }
    }
  }
}

app.get('/logs/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const logs = await getBookingLogs(userId);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).send({ message: 'Failed to fetch logs', error });
  }
});

app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);
});
