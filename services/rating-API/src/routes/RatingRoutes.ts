import express from 'express';
import { createRating, updateRating, getRatingsByEventId, getRatingsByUserId, getRatingByEventAndUserId, updateRatingByEventAndUserId  } from '../controllers/RatingController.js';

const router = express.Router();

router.post('/ratings', createRating);
router.put('/ratings/:id', updateRating);
router.put('/ratings/:eventId/:userId', updateRatingByEventAndUserId);
router.get('/ratings/event/:eventId', getRatingsByEventId);
router.get('/ratings/user/:userId', getRatingsByUserId);
router.get('/ratings/:eventId/:userId', getRatingByEventAndUserId);

export default router;