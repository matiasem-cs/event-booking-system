import express from 'express';
import {createEventTicketsRoute, createTicket, getTicketById, getTicketsByEventId, getTicketsQuantityAvailableAndLowestPrice, updateTicketById} from "../controllers/ticketController";
import { CREATE_TICKETS_FOR_EVENT_ROUTE, CREATE_TICKETS_ROUTE, GET_TICKETS_BY_EVENT_ID_ROUTE, GET_TICKETS_QUANTITY_AVAILABLE_AND_LOWEST_PRICE_ROUTE, GET_TICKET_BY_ID_ROUTE, UPDATE_TICKET_ROUTE } from '../consts';





const router = express.Router();


router.post(CREATE_TICKETS_ROUTE, createTicket);
router.post(CREATE_TICKETS_FOR_EVENT_ROUTE, createEventTicketsRoute);

router.put(UPDATE_TICKET_ROUTE, updateTicketById);

router.get(GET_TICKET_BY_ID_ROUTE, getTicketById);
router.get(GET_TICKETS_BY_EVENT_ID_ROUTE, getTicketsByEventId);
router.get(GET_TICKETS_QUANTITY_AVAILABLE_AND_LOWEST_PRICE_ROUTE, getTicketsQuantityAvailableAndLowestPrice);
// router.get('/tickets/lowestprice/:eventId', );




export default router;