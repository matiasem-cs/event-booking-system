import express from 'express';
import { CREATE_COMMENT_ROUTE, CREATE_EVENT_ROUTE, CREATE_ORDER_ROUTE, CREATE_RATING_ROUTE, GET_COMMENTS_BY_EVENT_ROUTE, GET_ALL_EVENTS_ROUTE, GET_EVENT_ROUTE, GET_ORDER_ROUTE, GET_RATING_BY_EVENT_AND_USER_ID_ROUTE, GET_TICKETS_BY_ENEVT_ID_ROUTE, GET_USER_HISTORY_ROUTE, PAY_ORDER_ROUTE, UPDATE_EVENT_DATE_ROUTE, UPDATE_RATING_BY_EVENT_AND_USER_ID_ROUTE, UPDATE_RATING_ROUTE, GET_EVENTS_BY_LOWEST_PRICE_ROUTE, GET_EVENTS_BY_PRICE_RANGE_ROUTE, GET_EVENTS_BY_PRICE_RANGE_SORTED_ROUTE, GET_EVENTS_WITH_TICKETS_AVAILABLE_ROUTE } from '../consts';
import { getAllEvents, getEvent, createEvent, updateEventDates, createOrder, payOrder, getOrder, createComment, getComments, createRating, updateRating, updateRatingByEventAndUserId, getRatingByEventAndUserId, getUserHistoryByUserId, getTicketsByEventId, getEventsByLowestPrice, getEventsByPriceRange, getEventsByPriceRangeSorted, getEventsWithTicketsAvailable } from '../controllers/gatewayControllers';

const router = express.Router();

// Event Routes
router.get(GET_ALL_EVENTS_ROUTE, getAllEvents); //checked
router.get(GET_EVENT_ROUTE, getEvent); // checked
router.post(CREATE_EVENT_ROUTE, createEvent); // checked
router.put(UPDATE_EVENT_DATE_ROUTE, updateEventDates); // checked
router.get(GET_EVENTS_BY_LOWEST_PRICE_ROUTE, getEventsByLowestPrice); // checked
router.get(GET_EVENTS_BY_PRICE_RANGE_ROUTE, getEventsByPriceRange); // checked
router.get(GET_EVENTS_BY_PRICE_RANGE_SORTED_ROUTE, getEventsByPriceRangeSorted); // checked
router.get(GET_EVENTS_WITH_TICKETS_AVAILABLE_ROUTE, getEventsWithTicketsAvailable); // checked

// Order Routes
router.post(CREATE_ORDER_ROUTE, createOrder); // checked
router.post(PAY_ORDER_ROUTE, payOrder); // checked
router.get(GET_ORDER_ROUTE, getOrder); // checked

// Ticket Routes
router.get(GET_TICKETS_BY_ENEVT_ID_ROUTE, getTicketsByEventId); // checked

// Comment Routes
router.post(CREATE_COMMENT_ROUTE, createComment); // checked
router.get(GET_COMMENTS_BY_EVENT_ROUTE, getComments); // checked

// Rating Routes
router.post(CREATE_RATING_ROUTE, createRating); // checked
router.put(UPDATE_RATING_ROUTE, updateRating); // checked
router.put(UPDATE_RATING_BY_EVENT_AND_USER_ID_ROUTE, updateRatingByEventAndUserId); // checked
router.get(GET_RATING_BY_EVENT_AND_USER_ID_ROUTE, getRatingByEventAndUserId); // checked

// User History Routes
router.get(GET_USER_HISTORY_ROUTE, getUserHistoryByUserId); // checked

export default router;