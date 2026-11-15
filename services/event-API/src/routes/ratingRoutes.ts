import express from 'express';
import { createRating, updateRating, getRatingsByEventId, getRatingsByUserId, getRatingByEventAndUserId, updateRatingByEventAndUserId  } from '../controllers/ratingControllers.js';
import { CREATE_RATING_ROUTE, UPDATE_RATING_ROUTE, GET_RATINGS_BY_EVENT_ID_ROUTE, GET_RATINGS_BY_USER_ID_ROUTE, GET_RATING_BY_EVENT_AND_USER_ID_ROUTE, UPDATE_RATING_BY_EVENT_AND_USER_ID_ROUTE } from '../consts.js';

const router = express.Router();

// Routes
router.post(CREATE_RATING_ROUTE, createRating);
router.put(UPDATE_RATING_ROUTE, updateRating);
router.get(GET_RATINGS_BY_EVENT_ID_ROUTE, getRatingsByEventId);
router.get(GET_RATINGS_BY_USER_ID_ROUTE, getRatingsByUserId);
router.get(GET_RATING_BY_EVENT_AND_USER_ID_ROUTE, getRatingByEventAndUserId);
router.put(UPDATE_RATING_BY_EVENT_AND_USER_ID_ROUTE, updateRatingByEventAndUserId);

export default router;