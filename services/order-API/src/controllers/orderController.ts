import { Request, Response } from 'express';
import axios from 'axios';
import Order , { OrderModel } from '../models/order.js';
import {
    updateTicketsFromOrder,
    validateObjectId,
    getTicketInfoById,
    garbageCollector,
    // USER_HISTORY_EXCHENGE,
    // EVENT_EXCHENGE,
    TWO_MIN_TIMER,
    ONE_MIN_TIMER,
    ORDER_CREATED_ACTION,
    RabbitMQMessage,
    FOUR_MIN_TIMER
} from '../consts';

import {
    // sendMessageFromTicketToEvent, 
    // sendMessageToService, 
    sendMessage} from "../messaging/rabbitmq";

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        // create a new order
        const { user_id, event_id, ticket_id, quantity_purchased, price } = req.body;

        if ( price < 0 || quantity_purchased < 0) {
            res.status(400).json({ message: "Invalid purchase details" });
            return;
        }

        // calculate purchaseTimeout
        const currentTime : Date = new Date();

        const ticketInfo = await getTicketInfoById(ticket_id);
        if (!ticketInfo) {
            console.log('Error - cant retrieve ticket info from Ticket service')
        }
        // @ts-ignore
        const {name} = ticketInfo.message;
        console.log(name)

        let newOrder = new Order(
            {
                user_id,
                event_id,
                ticket_id,
                ticket_type: name,
                datePurchased: currentTime,
                quantity_purchased,
                // purchaseTimeout,
                total_cost: price * quantity_purchased,
                paymentStatus: 'pending'
            });

            console.log(newOrder)
        try {
            await newOrder.validate();
        }
        catch (error) {
            res.status(400).json({ message: 'Invalid order' });
            return;
        }

        /* USER CLICKED BUY, PRE CHECKOUT SUBMISSION */
        try {
            // directly update ticket service available quantity
           const ticketUpdate =  await updateTicketsFromOrder(ticket_id, quantity_purchased.toString());

            if (!ticketUpdate.success) {
                res.status(400).json({ message: ticketUpdate.message});
                return;
            }

        } catch (error) {
            res.status(500).json({ message: 'Ticket service - Ticket update failed' });
        }

        // will save here only if (order - ticket) has no issues
        await newOrder.save();


        /* INIT USER PURCHASE TIMER */
        setTimeout(() => handleOrderTimeout(newOrder), TWO_MIN_TIMER);


        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Server Error - :(' });
    }
};//createOrder

// retrieve specific order
export const getOrderById = async (req: Request, res: Response): Promise<void>=> {
    try {
        const orderId: string = req.params.orderId;

        /* body and param validate */
        if (!validateObjectId(orderId, "orderId", res)) {
            return;
        }
        const order: OrderModel = await Order.findById( orderId );

        if (!order) {
            res.status(404).json({ message: "No order found"});
            return;
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// retrieve all orders for a specific user
export const getOrdersByUserId = async (req: Request, res: Response) : Promise<void> => {
    try {
        console.log(req.params)
        const user_id: string = req.params.userId;


        const userOrders: OrderModel[] = await Order.find( {user_id} );

        if (!userOrders) {
            res.status(404).json({ message: "no user found"});
            return;
        }

        res.status(200).json({ userOrders });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server Error` });
    }
}

// retrieve all orders for a specific event
export const getOrdersByEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(req.params)
        const event_id: string = req.params.eventId;
        const eventOrders: OrderModel[] = await Order.find( {event_id} );

        if (!eventOrders) {
            res.status(404).json({ message: "no event found"});
            return;
        }

        res.status(200).json({ eventOrders });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server Error` });
    }
}

/* PAYMENT PROCESS HANDLING FUNCTIONS */

export const handlePayment = async (req: Request, res: Response) => {
    try {
        // destructure request
       const { order_id, payment_details} = req.body;
        console.log(`order-id: ${order_id}`)
        console.log(payment_details)

       // initial fetch
        const order = await Order.findById (order_id)


        if (!order) {
            res.status(404).json({ message: "No order found"});
            return;
        }

        if (order.paymentStatus === 'failure') {
            // attempted buy after timeout / server error - return fail
            res.status(500).json({message: "Credit card server error"})
            return;
        }

        order.paymentStatus = 'waiting_payment';
        await order.save();


        // attempt payment loop
        let updatedOrder = await Order.findById(order_id)
        let attempts = 1;
        while (updatedOrder.paymentStatus === 'waiting_payment' && attempts <= 3) {

            try {
                // api call Hammerhead
                console.log(`calling Hammerhead, attempt: ${attempts}`)
                const response = await axios.post('https:/www.cs-wsp.net/_functions/pay', payment_details);

                // Handle the response accordingly
                console.log('Hammerhead Response:', response.data);
                console.log(`Hammerhead response status: ${response.status}`)

                if (response.status === 200) {
                    order.paymentStatus = 'approved';

                    await order.save();

                    // send update message to User History service through RabbitMQ
                    let message : RabbitMQMessage = {action: ORDER_CREATED_ACTION, data: order}
                    // await sendMessageToService(JSON.stringify(message), USER_HISTORY_EXCHENGE)
                    await sendMessage(JSON.stringify(message), 'Order service');

                    res.status(200).json({message: "Payment successful!", response : response.data})
                    break; // exit the loop if payment was successful
                } else {
                    attempts++;
                }
                // fetch up-to-date order status
                updatedOrder = await Order.findById(order_id)
            } catch (error) {
                console.error('Error making API call:', error);
                attempts++;
            }
        }


        /* USER PURCHASE FAILED */
        // @ts-ignore
        if (attempts >= 3 || order.paymentStatus === 'waiting_payment_overtime') {

            order.paymentStatus = 'failure';

            await order.save();

            console.log(`order - ${order._id} failed. payment status: ${order.paymentStatus}`)

            order.quantity_purchased = -order.quantity_purchased; // to inc db quantity - sub negative number

            // revert Event \ Ticket service overall ticket quantity
            try {
                // directly update ticket service available quantity
                const ticketUpdate =  await updateTicketsFromOrder(order.ticket_id, order.quantity_purchased.toString());

                if (!ticketUpdate.success) {
                    res.status(400).json({ message: ticketUpdate.message});
                    return;
                }
            } catch (error) {
                res.status(500).json({ message: 'Ticket service - Ticket update failed' });
            }

            // init garbageCollector timer
            setTimeout(() => garbageCollector(), FOUR_MIN_TIMER);

            res.status(500).json({message: "Credit card server error"})
            return;
        }

    } catch (error) {
        res.status(500).json({ message: `Server Error` });
    }
}


const handleOrderTimeout = async (newOrder)  => {
    try {
        console.log("TIMEOUT REACHED !")
        // Find the order by ID
        const order = await Order.findById(newOrder._id);

        console.log(`order payment status: ${order.paymentStatus}`)

        if (order.paymentStatus === 'pending') {
            // Update the order status to 'failure'
            order.paymentStatus = 'failure';

            await order.save();

            console.log('Order status updated to failure due to timeout');


            // update back ticket quantity
            const updateResult =  await updateTicketsFromOrder(order.ticket_id, (-order.quantity_purchased).toString());

            if (!updateResult.success) {
               console.log(updateResult.message)
                return;
            }

            // init garbageCollector timer
            setTimeout(() => garbageCollector(), FOUR_MIN_TIMER);

            // this is a helper function invkoed by create order - status will be fail / garbage
            // this + timer mechanism in FE will ensure no user will send request after 2 min
            // if user attmepts this - handlePayment will send an error


        } else if (order.paymentStatus === 'waiting_payment') {
            console.log('payment process not finished !')

            // user has clicked on submit button, payment might be handled at the moment
            order.paymentStatus = 'waiting_payment_overtime'

            await order.save();
        }
    } catch (error) {
        console.error('Failed to update order status:', error);
    }
};