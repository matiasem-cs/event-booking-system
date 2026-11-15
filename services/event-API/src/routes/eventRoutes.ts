import express from 'express';
import { getAllEvents, getEvent, createEvent, updateEventDates, getEventsByLowestPrice, getEventsByPriceRange, getEventsByPriceRangeSorted, getAllEventsWithTicketsAvailable } from '../controllers/eventControllers.js';
import { GET_ALL_EVENTS_ROUTE, GET_EVENT_ROUTE, CREATE_EVENT_ROUTE, UPDATE_EVENT_DATE_ROUTE, GET_EVENTS_BY_LOWEST_PRICE_ROUTE, GET_EVENTS_WITH_TICKETS_AVAILABLE_ROUTE, GET_EVENTS_BY_PRICE_RANGE_ROUTE, GET_EVENTS_BY_PRICE_RANGE_SORTED_ROUTE } from '../consts.js';

const router = express.Router();


router.get(GET_ALL_EVENTS_ROUTE, getAllEvents);
router.get(GET_EVENT_ROUTE, getEvent);
router.get(GET_EVENTS_BY_LOWEST_PRICE_ROUTE, getEventsByLowestPrice); // http://your-api-url/eventsByLowestPrice?skip=0&limit=10
router.get(GET_EVENTS_BY_PRICE_RANGE_ROUTE, getEventsByPriceRange); // http://your-api-url/eventsByPriceRange?fromPrice=10&toPrice=50&skip=0&limit=10
router.get(GET_EVENTS_BY_PRICE_RANGE_SORTED_ROUTE, getEventsByPriceRangeSorted); // http://your-api-url/eventsByPriceRangeSorted?fromPrice=10&toPrice=50&skip=0&limit=10
router.get(GET_EVENTS_WITH_TICKETS_AVAILABLE_ROUTE, getAllEventsWithTicketsAvailable); // http://your-api-url/eventsWithTicketsAvailable

router.post(CREATE_EVENT_ROUTE, createEvent);

router.put(UPDATE_EVENT_DATE_ROUTE, updateEventDates);


export default router;