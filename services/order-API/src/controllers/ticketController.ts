import { Request, Response } from 'express';
import Ticket , { TicketModel } from '../models/ticket.js';
import mongoose from "mongoose";
import { validateObjectId} from "../consts";

/* API CALL HANDLERS */
export const createTicket = async (req: Request, res: Response) => {
    try {
        const { event_id, name, quantity_available, price } = req.body;

        /* body and param validate */

        // validate id's are mongoDB compliant - only relevant when all id's are from a collection.
        /*
        if (!validateObjectId(event_id, "event", res)) {
            return;
        }
        */


        let newTicket = new Ticket({ event_id, name, quantity_available, price });

        try {
            await newTicket.validate();
        }
        catch (error) {
            res.status(400).json({ message: 'Invalid ticket' });
            return;
        }

        await newTicket.save();

        res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });

    } catch (error) {
        res.status(500).json({ message: 'Server Error - :(' });
    }
}//createTicket

export const getTicketById = async (req: Request, res: Response) => {
    try {
        const ticket_id = req.params.ticketId;
        console.log(`ticket_id: ${ticket_id}`)

        /* body and param validate */
        if (!validateObjectId(ticket_id, "ticket", res)) {
            return;
        }

        const ticket: TicketModel = await Ticket.findById( ticket_id );

        if (!ticket) {
            res.status(404).json({ message: "No ticket found"})
            return;
        }

        res.status(200).json({ ticket });

    } catch (error) {
        res.status(500).json({ message: 'Server Error - :(' });
    }
}//getTicketById

// retrieve all tickets for a specific event
export const getTicketsByEventId = async (req: Request, res: Response) => {
    try {
        const event_id = req.params.eventId;

        const skip = parseInt(req.query.skip as string || '0', 10);
        const limit = parseInt(req.query.limit as string || '20', 10);
        console.log(`skip: ${skip}, limit: ${limit}`)

        const eventTickets : TicketModel[] = await Ticket.find( {event_id} )
            .skip(skip)
            .limit(limit)
            .exec();

        res.status(200).json( eventTickets );
    } catch (error) {
        res.status(500).json({ message: 'Server Error - :(' });
    }
}//getTicketsByEventId

export const updateTicketById = async (req: Request, res: Response) => {
    try {
        const ticket_id = req.params.ticketId;
        const { quantity_purchased } = req.body;
        console.log(`qty_to_subtract: ${quantity_purchased}`)

        /* body and param validations */
        if (!mongoose.Types.ObjectId.isValid(ticket_id)) {
            res.status(400).json({ message: "Invalid ticket ID" });
            return;
        }

        //todo: if purchase failed - add negative amount of tickets (add a check for if status failed)
        if ( quantity_purchased <= 0) {
            res.status(400).json({ message: "Invalid quantity to subtract" });
            return;
        }

        const updatedTicket: TicketModel = await Ticket.findOneAndUpdate(
            {
                _id: ticket_id,
                quantity_available: { $gte: quantity_purchased } // check quantity_available >= quantityToSubtract
            },
            { $inc: { quantity_available: -quantity_purchased } }, // Atomic decrement
            { new: true } // Return the updated ticket document after the update
        );

        /* check if ticket exists */
        if (!updatedTicket) {
            res.status(400).json({ message: "No ticket found or cant subtract more than available"})
            return;
        }

        /* Check if quantity available reached 0 */
        if (updatedTicket.quantity_available === 0) {
            // todo: Publish message on RabbitMQ indicating ticket sold out
            // Example: rabbitMQ.publish('ticket_sold_out', { ticketId: ticket._id });
            console.log(`for ticket name: ${updatedTicket.name} all seats were sold out!`)
        }

        res.status(200).json({ message: "Ticket quantity updated successfully", updatedTicket });

    } catch (error) {
        res.status(500).json({ message: 'Server Error - :(' });
    }
}//updateTicketById


export const getTicketsQuantityAvailableAndLowestPrice = async (req: Request, res: Response) => {
    try {
        const event_id = req.params.eventId;

        // find all tickets for the event
        const tickets = await Ticket.aggregate([
            {
                $match: {
                    event_id: event_id,
                    quantity_available: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: "$quantity_available" },
                    lowestPrice: { $min: "$price" }
                }
            }
        ]);

        const totalQuantity = tickets.length > 0 ? tickets[0].totalQuantity : 0;
        const lowestPrice = tickets.length > 0 ? tickets[0].lowestPrice : 0;

        if (!tickets) {
            res.status(404).json({ message: "No tickets found for event" });
            return;
        }

        res.status(200).json({ quantity_avalaible: totalQuantity, lowest_price_available: lowestPrice});

    } catch (error) {
        res.status(500).json({ message: 'Server Error - :(' });
    }
}//getTicketsQuantityAvailableAndLowestPrice


export const createEventTicketsRoute = async (req: Request, res: Response) => {
    try {
        const event_id = req.params.eventId;
        const { tickets } = req.body;
        console.log('req.body:', req.body)
        console.log(`event_id: ${event_id}, tickets: ${tickets}`)

        // validate event_id
        if (!event_id) {
            res.status(400).json({ message: 'Invalid provided event ID' });
            return;
        }

        // for each object in the array create a ticket object
        for (const ticket of tickets) {
            const { name, quantity_available, price } = ticket;

            // validate ticket field according to Ticket schema
            if (!name || !quantity_available || !price) {
                res.status(400).json({ message: 'Ticket information is incomplete' });
                return;
            }
            if (quantity_available < 0) {
                res.status(400).json({ message: 'Quantity must be equal or greater than 0' });
                return;
            }
            if (price < 0) {
                res.status(400).json({ message: 'Price cannot be negative' });
                return;
            }

            // create new ticket object for provided ticket object
            try {
                const newTicket = new Ticket({
                    event_id,
                    name,
                    quantity_available,
                    price
                });

                await newTicket.save();

            } catch (error) {
                res.status(500).json({ message: 'Failed to save ticket to the database' });
                return;
            }
        }

        res.status(201).json({ message: 'Tickets created successfully' });

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Server Error - :(' });
    }
}


/* ASYNC MESSAGE HANDLERS */
// export const createEventTickets = async (ticketsData) => {
//     try {
//         // receive array of tickets
//         const { event_id, tickets } = ticketsData

//         // validate event_id
//         if (!ticketsData.event_id) {
//             throw new Error('Invalid provided event ID');
//         }
//         // for each object in the array create a ticket object
//         for (const ticket of tickets) {
//             const { name, quantity, price } = ticket;

//             // validate ticket field according to Ticket schema
//             if ( !name || !quantity || !price) {
//                 throw new Error('Ticket information is incomplete');
//             }
//             if (quantity < 0) {
//                 throw new Error('Quantity must be equal or greater than 0');
//             }
//             if (price < 0) {
//                 throw new Error('Price cannot be negative');
//             }

//             // create new ticket object for provided ticket object
//             try {
//                 const newTicket = new Ticket({
//                     event_id,
//                     name,
//                     quantity_available: quantity,
//                     price
//                 });

//                 await newTicket.save();

//             } catch (error) {
//                 console.error('Failed to save ticket to the database:', error.message);
//             }

//         }

//     } catch (error) {
//         console.error(`Failed to create tickets to event with event_id: ${ticketsData.event_id}`, error);
//     }
// }

export const getTicketsQuantityAvailableAndLowestPriceForMessage = async (event_id: string) => {
    try {
        // find all tickets for the event
        const tickets = await Ticket.aggregate([
            {
                $match: {
                    event_id: event_id,
                    quantity_available: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: "$quantity_available" },
                    lowestPrice: { $min: "$price" }
                }
            }
        ]);

        const totalQuantity = tickets.length > 0 ? tickets[0].totalQuantity : 0;
        const lowestPrice = tickets.length > 0 ? tickets[0].lowestPrice : 0;

        if (!tickets) {
            return { quantity_available: 0, lowest_price_available: 0 };
        }
        console.log('ticket qunatity before message sent:', totalQuantity, lowestPrice)
        return { quantity_available: totalQuantity, lowest_price_available: lowestPrice};
        
    } catch (error) {
        console.error('Error fetching tickets quantity and lowest price:', error);
    }
}

export const deleteTicktsByEventId = async (data: any) => {
    try {
        const { event_id } = data;

        // find all tickets for the event
        const tickets = await Ticket.find({ event_id });

        if (!tickets) {
            console.error('No tickets found for event with event_id: ', event_id, ' to delete');
            return;
        }

        // delete all tickets for the event
        await Ticket.deleteMany({ event_id });

    } catch (error) {
        console.error('Error deleting tickets:', error);
    }
}