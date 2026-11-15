import { Request, Response } from 'express';
import axios from 'axios';
import UserHistory, {UserHistoryModel} from "../models/userHistory";
import {
    EVENT_UPDATED_DATE_ACTION,
    ORDER_CREATED_ACTION,
    UpdateClosestEvtMsg,
    RabbitMQMessage,
    USER_EXCHENGE,
    USER_ORDERED_EVENT_ACTION,
    UPDATE_CLOSEST_EVENT_ACTION
} from "../consts";
import {sendMessage} from "../messaging/rabbitmq";
import { send } from 'process';

/* API CALL HANDLERS */
export const getHistoryByUserId = async (req : Request, res: Response) => {
    try {
        const user_id = req.params.userId;

        const userHistory: UserHistoryModel[] = await UserHistory.find({user_id} );

        if (!userHistory) {
            res.status(404).json({ message: "No user history found."});
            return;
        }

        res.status(200).json({ userHistory });
    } catch (error) {
        res.status(500).json({ message: `Server Error` });

    }
}

/* ASYNC MESSAGE HANDLERS */
export const messageHandler = (action, messageData : string) => {

    switch (action) {
        case ORDER_CREATED_ACTION:
            updateUserOrders(messageData)
            break;
        case EVENT_UPDATED_DATE_ACTION:
            handleUpdateEvent(messageData)
            break;
        default:
            console.log('Unknown message received in UserHistory consumer', action);
    }
}


/* CRUD FUNCTIONS */

// this function add an order to the userHistory
export const updateUserOrders = async (order) => {
    try {

        // check DB if user_name + event_id exist
        const {user_id, event_id} = order

        console.log(`user: ${user_id}, event: ${event_id}`)
        const userEvent = await UserHistory.findOne({user_id, event_id})

        if (!userEvent) {
            // FIRST ORDER FOR THIS EVENT FOR THE USER
            const eventURL = process.env.EVENT_API_URL || 'http://localhost:3001';
            const endpoint = eventURL + `/api/events/${event_id}`;
            // fetch event info
            const response = await axios.get(endpoint);
            // const response = await axios.get(`http://https://localhost:3001/api/events/${event_id}`);

            const eventInfo = response.data;

            console.log('eventInfo === ', eventInfo)
            // send message to User service via RabbitMQ (possible user bar closest event update)
            const orderedEventDetails = {
                user_id: order.user_id,
                event_id: eventInfo._id,
                eventName: eventInfo.title,
                start_date: eventInfo.start_date,
            }
            const message : RabbitMQMessage = {action: USER_ORDERED_EVENT_ACTION, data: orderedEventDetails}
            // sendMessageToService(JSON.stringify(message), USER_EXCHENGE)
            sendMessage(JSON.stringify(message), 'UserHistory service');
            console.log(message.action)
            console.log(message.data)

            console.log(eventInfo)

            // create UserHistoryEvent object
            const userEvent  = new UserHistory({
                user_id : user_id,
                event_id : event_id,
                event_details: {
                    title: eventInfo.title,
                    category : eventInfo.category,
                    location: eventInfo.location,
                    organizer: eventInfo.organizer,
                    start_date: eventInfo.start_date,
                    end_date: eventInfo.end_date,
                    img: eventInfo.img
                },
                order_details : [
                    {
                        totalCost: order.total_cost,
                        datePurchased: order.datePurchased,
                        tickets: {
                            name: order.ticket_type,
                            quantity: order.quantity_purchased
                        }
                    }
                ]
            })
            // validate + save
            console.log(userEvent)
            try {
                await userEvent.validate();
            }
            catch (error) {
                console.error('Failed to validate userHistory document', error);
                return;
            }

            console.log('saving new event to users order history list...')
            await userEvent.save();
        }
        else {
            // new order for a user an existing event order
            console.log('Adding new order to users order array for the given event...')
            const orderedEvent = await UserHistory.findOneAndUpdate(
                { user_id: user_id, event_id: event_id },

                // push the new order details object into the existing order_details array
                {
                    $push: {
                        'order_details': {
                            totalCost: order.total_cost,
                            datePurchased: order.datePurchased,
                            tickets: {
                                name: order.ticket_type,
                                quantity: order.quantity_purchased
                            }
                        }
                    }
                },
                { new: true }
            )
        }
    } catch (error) {
        console.error('Failed to fetch event:', error);
    }

}//updateUserOrders


export const handleUpdateEvent = async (data) => {
    // query all user_id's where the postponed event is their closest event
    const postponedClosestEventUsers = await getUsersWithClosestEvent(data.event_id);

    console.log(postponedClosestEventUsers)

    // update the given event_id's start time
    await updateEventTime(data)

    // for each relevant user id's, use the getUserClosestEvent and compile a single message for User service
    let updateClosestEvtMsg: UpdateClosestEvtMsg[]  = [];


    // Execute getUserClosestEvent for each user concurrently using Promise.all
    await Promise.all(postponedClosestEventUsers.map(async (userId) => {

        const closestEventInfo  = await getClosestEvent(userId);

        // add received object to msg
        updateClosestEvtMsg.push({
            user_id: userId,
            closest_event: closestEventInfo
        });

    }));

    // send message to User service via RabbitMQ
    const message : RabbitMQMessage = {action: UPDATE_CLOSEST_EVENT_ACTION, data: updateClosestEvtMsg}
    // sendMessageToService(JSON.stringify(message), USER_EXCHENGE)
    sendMessage(JSON.stringify(message), 'UserHistory service');
    console.log(message.action)
    console.log(message.data)

}//handleUpdateEvent

export const getUsersWithClosestEvent = async (event_id) => {
    try {
        // Find all users who have an order for the given event_id (among other orders)
        const orderedEventUsers = await UserHistory.find({ event_id }, { user_id: 1 });

        // Extract user IDs from the results
        const userIDs = orderedEventUsers.map(user => user.user_id);


        const filteredUserIDs = await Promise.all(userIDs.map(async (usr) => {
            const closestEvt = await getClosestEvent(usr);
            // console.log("cllosest event:")
            // console.log(closestEvt)
            // console.log(`for user ${usr}, closest event id: ${closestEvt.event_id}`);
            return closestEvt.event_id === event_id ? usr : null;
        }));

        const postponedEventUserIds = filteredUserIDs.filter(userId => userId !== null)


        console.log(postponedEventUserIds)

        return postponedEventUserIds;
    } catch (error) {
        console.error(`Failed to fetch users with closest event for eventId: ${event_id}`, error);
        throw error; // Propagate error to caller
    }
};

export const updateEventTime = async (data) => {
    try {
        const { event_id, start_date, end_date } = data;

        console.log(`updating event time for eventId: ${data.event_id}`)

        // Update documents with the given event_id
        const result = await UserHistory.updateMany({ event_id }, {
            $set: {
                "event_details.start_date": start_date,
                "event_details.end_date": end_date
            }
        });

        console.log(`${result.modifiedCount} document(s) updated successfully`);
    } catch (error) {
        console.error(`For eventId: ${data.event_id}, Failed to update event Time:`, error);
    }
};


const getClosestEvent = async (user_id) => {
    try {
        const currentDate = new Date();

        // findOne will return the closest event because of the ascending sort by start_date
        const closestEvent = await UserHistory.findOne({
            user_id,
            'event_details.start_date': { $gt: currentDate } // Filter out past events
        })
            .select('event_id event_details.title event_details.start_date') // Project  event title and start_date
            .sort('event_details.start_date') // sort by start_date in ascending order
            .lean();

        return {
            event_id: closestEvent.event_id,
            title: closestEvent.event_details.title,
            start_date: closestEvent.event_details.start_date
        };

    } catch (error) {
        console.log(`Error - For user ${user_id}, could not retrieve closest event_id.`);
    }
}//getClosestEvent


// export const getUsersClosestEvt = async (req: Request, res: Response) => {
//     try {
//         const user_id = req.params.userId;
//
//         const currentDate = new Date();
//
//         // findOne will return the closest event because of the ascending sort by start_date
//         const closestEvent = await UserHistory.findOne({
//             user_id,
//             'event_details.start_date': { $gt: currentDate } // Filter out past events
//         })
//             .select('event_details.title event_details.start_date') // Project  event title and start_date
//             .sort('event_details.start_date') // sort by start_date in ascending order
//             .lean();
//
//
//         res.status(200).json({ closestEvent });
//
//     } catch (error) {
//         res.status(500).json({ message: `Server Error` });
//     }
// }//getUserClosestEvent

