import Hotel from '../models/hotel.js';

export const getHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createHotel = async (req, res) => {
    const { name, price, amenities, location } = req.body;

    try {
        const newHotel = new Hotel({ name, price, amenities, location });
        await newHotel.save();
        res.status(201).json(newHotel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
