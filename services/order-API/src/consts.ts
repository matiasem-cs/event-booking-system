import mongoose from "mongoose";
import Ticket, {TicketModel} from "./models/ticket";
import Order, {OrderModel} from "./models/order";
import { 
    // sendMessageFromTicketToEvent, 
    // sendMessageToService, 
    sendMessage } from "./messaging/rabbitmq";
import { getTicketsQuantityAvailableAndLowestPriceForMessage } from "./controllers/ticketController";


export enum EventCategory {
    CharityEvent = "Charity Event",
    Concert = "Concert",
    Conference = "Conference",
    Convention = "Convention",
    Exhibition = "Exhibition",
    Festival = "Festival",
    ProductLaunch = "Product Launch",
    SportsEvent = "Sports Event",
}

interface EventOrderMessage {
    event_id: string,
    ticket_id : string,
    quantity_purchased: number
}

export interface RabbitMQMessage {
    'action': string, 'data': OrderModel | number | string | EventOrderMessage
}

export const PROJECT_EXCHANGE = 'project_exchange';

export const EVENT_EXCHENGE = 'event_exchange';
export const TICKET_EXCHENGE = 'ticket_exchange';
export const TICKET_QUEUE = 'ticket_queue';
export const ORDER_EXCHENGE = 'order_exchange';
export const ORDER_QUEUE = 'order_queue';
export const USER_HISTORY_EXCHENGE = 'user_history_exchange';
export const GATEWAY_EXCHENGE = 'gateway_exchange';

/* TIMEOUT OPTIONS */
export const TWO_MIN_TIMER = 2 * 60 * 1000;
export const ONE_MIN_TIMER = 60 * 1000;

export const FOUR_MIN_TIMER = 4 * 60 * 1000;


/** RabbitMQ actions **/
export const ORDER_CREATED_ACTION = 'order_created';
export const ORDER_TICKET_SUBTRACT_ACTION = 'order_ticket_subtract';
export const ORDER_TICKET_ADDITION_ACTION = 'order_ticket_add';
export const EVENT_CREATED_ACTION = 'event_created';
export const UPDATE_EVENT_LOWEST_PRICE_ACTION = 'update_event_lowest_price';
export const TICKETS_QUANTITY_CHANGED_ACTION = 'tickets_quantity_changed';


/** Routes **/
export const CREATE_TICKETS_ROUTE = '/tickets';
export const UPDATE_TICKET_ROUTE = '/tickets/:ticketId';
export const GET_TICKET_BY_ID_ROUTE = '/tickets/:ticketId';
export const GET_TICKETS_BY_EVENT_ID_ROUTE = '/tickets/event/:eventId';
export const GET_TICKETS_QUANTITY_AVAILABLE_AND_LOWEST_PRICE_ROUTE = '/tickets/quantity-lowestprice/:eventId';
export const CREATE_TICKETS_FOR_EVENT_ROUTE = '/tickets/event/:eventId';
export const DELETE_TICKETS_BY_EVENT_ID_ACTION = 'delete_tickets_by_event_id';





/** UTILITY FUNCTIONS **/
export const getLowestPrice = async (event_id: string): Promise<number> => {
    try {
        // Aggregate pipeline to filter tickets by event_id and quantity_available > 0
        const pipeline = [
            { $match: { event_id: event_id, quantity_available: { $gt: 0 } } },
            { $group: { _id: null, lowestPrice: { $min: '$price' } } }
        ];

        // Execute the aggregation pipeline
        const result = await Ticket.aggregate(pipeline);

        // Check if any tickets with quantity > 0 exist
        if (result.length > 0) {
            return result[0].lowestPrice;
        } else {
            // If no tickets with quantity > 0, return 0
            return 0;
        }
    } catch (error) {
        // Handle any errors
        console.error('Error fetching lowest price:', error);
        throw error;
    }
};


export const updateTicketsFromOrder = async (ticket_id, quantity_purchased) => {
    try {
        console.log('updateTicketsFromOrder quantity_purchased',quantity_purchased);
        const ticket = await Ticket.findById(ticket_id);
        if (!ticket) {
            return { success: false, message: "No ticket found" };
        }
        if (ticket.quantity_available < quantity_purchased) {
            return { success: false, message: "Not enough tickets available" };
        }
        // if(ticket.quantity_available === 0){
        //     updateLowestPrice = true;
        // }

        ticket.quantity_available -= quantity_purchased;

        await ticket.save();

        // send message to event service to update quantity and lowest price
        const { quantity_available, lowest_price_available } = await getTicketsQuantityAvailableAndLowestPriceForMessage(ticket.event_id);

        let message = {action: TICKETS_QUANTITY_CHANGED_ACTION, 
            data: {event_id: ticket.event_id,
                quantity_available: quantity_available, 
                lowest_price_available: lowest_price_available
            }
        };
    
        console.log('updateTicketsFromOrder before send message',message);
        // await sendMessageToService(JSON.stringify(message),EVENT_EXCHENGE);
        await sendMessage(JSON.stringify(message),'Ticket service');
        // await sendMessageFromTicketToEvent(JSON.stringify(message));
    
        console.log('updateTicketsFromOrder ticket after update',ticket);
        return { success: true, message: "Ticket service - quantity updated successfully" };
        
    } catch (error) {
        console.error(error);
        return { success: false, message: "Ticket service - Server Error" };
    }
};






// validateObjectId - validates provided id is mongoDB compliant
export const validateObjectId = (objectId, fieldName, res) => {
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
        res.status(400).json({ message: `Invalid ${fieldName} ID` });
        return false;
    }
    return true;
};


export const getTicketInfoById = async (ticketId) => {
    try {

        const ticket: TicketModel = await Ticket.findById( ticketId );

        if (!ticket) {
            return { success: false, message: "Error retrieving ticket info for order - no ticket found" };
        }

        return {success: true, message: ticket}

    } catch (error) {
        return { success: false, message: "Error retrieving ticket info for order" };

    }
}

// Garbage Collector - queries failed orders and removes them from DB
export const garbageCollector = async () => {
    try {
        const projection = {
            _id: 1,    // Exclude the _id field
        };

        const failedOrders  = await Order.find({ paymentStatus: 'failure' }, {projection});
        console.log(failedOrders)

        for (const failedOrder of failedOrders) {
            try {

                await Order.findByIdAndDelete(failedOrder._id);

            } catch (error) {
                console.error(`Error deleting order ID: ${failedOrder._id}`, error);
            }
        }

        console.log('Garbage Collected !')

    } catch (error) {
        console.log('Garbage collector - Server error', error)
    }
}//garbageCollector


