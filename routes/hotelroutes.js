import express from 'express';
import { getHotels, createHotel } from '../controllers/hotelcontroller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getHotels);
router.post('/', auth, createHotel);

export default router;
