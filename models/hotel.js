import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    amenities: { type: [String], required: true },
    location: { type: String, required: true },
    reviews: [{ userId: mongoose.Schema.Types.ObjectId, rating: Number, comment: String }]
});

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;
