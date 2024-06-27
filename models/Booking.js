const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  username: String,
  hotelName: String,
  checkInDate: Date,
  checkOutDate: Date,
  paymentStatus: String,
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
