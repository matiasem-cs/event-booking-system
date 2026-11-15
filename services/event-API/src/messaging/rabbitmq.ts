import * as amqp from 'amqplib';
import * as dotenv from 'dotenv';
import { COMMENT_CREATED_ACTION, DELETE_EVENT_ACTION, EVENT_QUEUE, PROJECT_EXCHANGE, RATING_CREATED_ACTION, RATING_UPDATED_ACTION, TICKETS_QUANTITY_CHANGED_ACTION,  UPDATE_EVENT_LOWEST_PRICE_ACTION } from '../consts';
import { deleteEventById, increaseEventCommentCount, updateEventExistingRating, updateEventLowestPriceAndQuantityAvailable, updateLowestPriceAvailable } from '../controllers/eventControllers';

dotenv.config();

let rabbitMQConnection: amqp.Connection;
// let eventChannel: amqp.Channel;
// let ratingChannel: amqp.Channel;

let channel: amqp.Channel;


// Function to create a channel on the RabbitMQ connection
export async function createChannel() {
    try {
        const rabbitMQConnection = await amqp.connect(`amqps://tlncafeu:${process.env.RABBITMQPASS}@cow.rmq2.cloudamqp.com/tlncafeu`);
        // Create channels for different exchanges
        // eventChannel = await rabbitMQConnection.createChannel();
        // ratingChannel = await rabbitMQConnection.createChannel(); 
        channel = await rabbitMQConnection.createChannel();

        // Declare exchanges on respective channels
        // await eventChannel.assertExchange(EVENT_EXCHENGE, 'fanout', { durable: false });
        // await ratingChannel.assertExchange(RATING_EXCHENGE, 'fanout', { durable: false });
        await channel.assertExchange(PROJECT_EXCHANGE, 'fanout', { durable: false });

        console.log('RabbitMQ channel created');
    } catch (error) {
        console.error('Error creating channel:', error);
        throw error; // Rethrow the error for handling by the caller
    }
}


export async function consumeMessages() {
    // Assert queues
    // await eventChannel.assertQueue(EVENT_QUEUE, {durable: false});
    // await ratingChannel.assertQueue(RATING_QUEUE, {durable: false});
    await channel.assertQueue(EVENT_QUEUE, {durable: false});
    // await channel.assertQueue('temp_event_queue', {durable: false});
    
    // Bind queues to exchanges
    // await eventChannel.bindQueue(EVENT_QUEUE, EVENT_EXCHENGE, '');
    // await ratingChannel.bindQueue(RATING_QUEUE, RATING_EXCHENGE, '');
    // await eventChannel.bindQueue(EVENT_QUEUE, TICKET_EXCHENGE, '');
    await channel.bindQueue(EVENT_QUEUE, PROJECT_EXCHANGE, '');
    // await channel.bindQueue('temp_event_queue', PROJECT_EXCHANGE, '');

    // Consume messages
    channel.consume(EVENT_QUEUE, (msg) => {
        if (msg != null) {
            const {action, data} = JSON.parse(msg.content.toString());
            console.log(`Received message for event: ${msg.content.toString()}`);
            // Route message to appropriate controller based on message content
            switch (action) {
                case RATING_CREATED_ACTION:
                    updateEventExistingRating(data); // Call createRating controller function
                    break;
                case RATING_UPDATED_ACTION:
                    updateEventExistingRating(data); // Call updateRating controller function
                    break;
                case TICKETS_QUANTITY_CHANGED_ACTION:
                    updateEventLowestPriceAndQuantityAvailable(data); // Call updateEventLowestPriceAndQuantityAvailable controller function
                    break;
                case COMMENT_CREATED_ACTION:
                    increaseEventCommentCount(data); // Call createComment controller function
                    break;
                case UPDATE_EVENT_LOWEST_PRICE_ACTION:
                    updateLowestPriceAvailable(data); // Call updateEventLowestPrice controller function
                    break;
                case DELETE_EVENT_ACTION:
                    deleteEventById(data); // Call deleteEvent controller function
                    break;
                default:
                    console.log('Unknown message received in Event consumer', action);
            }

            // Acknowledge message processing
            channel.ack(msg);
        }
    });

    // channel.consume('temp_event_queue', (msg) => {
    //     if (msg != null) {
    //         const {action, data} = JSON.parse(msg.content.toString());
    //         console.log(`Received message for temp_event_queue: ${msg.content.toString()}`);
    //         // Route message to appropriate controller based on message content
    //         switch (action) {
    //             case RATING_CREATED_ACTION:
    //                 updateEventExistingRating(data); // Call createRating controller function
    //                 break;
    //             case RATING_UPDATED_ACTION:
    //                 updateEventExistingRating(data); // Call updateRating controller function
    //                 break;
    //             case TICKETS_QUANTITY_CHANGED_ACTION:
    //                 updateEventLowestPriceAndQuantityAvailable(data); // Call updateEventLowestPriceAndQuantityAvailable controller function
    //                 break;
    //             case COMMENT_CREATED_ACTION:
    //                 increaseEventCommentCount(data); // Call createComment controller function
    //                 break;
    //             case UPDATE_EVENT_LOWEST_PRICE_ACTION:
    //                 updateLowestPriceAvailable(data); // Call updateEventLowestPrice controller function
    //                 break;
    //             case DELETE_EVENT_ACTION:
    //                 deleteEventById(data); // Call deleteEvent controller function
    //                 break;
    //             default:
    //                 console.log('Unknown message received in Event consumer', action);
    //         }

    //         // Acknowledge message processing
    //         channel.ack(msg);
    //     }
    // });
}

export async function sendMessage(message: string, service: string) {
    if (!channel) {
        channel = await rabbitMQConnection.createChannel();
    }
    // Publish message to the exchange
    await channel.publish(PROJECT_EXCHANGE, '', Buffer.from(message));
    console.log(`Publisher ${service} >>> | message "${message}" published to exchange "${PROJECT_EXCHANGE}"`);
}


// export async function sendMessageFromEventToEvent(message: string) {
//     // Publish message to the exchange
//     await eventChannel.publish(EVENT_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher >>> | message "${message}" published to exchange "${EVENT_EXCHENGE}"`);
// }


// export async function sendMessageFromRatingToEvent(message: string) {
//     // Publish message to the exchange
//     await ratingChannel.publish(EVENT_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher >>> | message "${message}" published to exchange "${EVENT_EXCHENGE}"`);
// }


// export async function sendMessageFromRatingToRating(message: string) {
//     // Publish message to the exchange
//     await ratingChannel.publish(RATING_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher >>> | message "${message}" published to exchange "${RATING_EXCHENGE}"`);
// }

// export async function sendMessageFromRatingToUser(message: string) {
//     // Publish message to the exchange
//     await ratingChannel.publish(USER_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher >>> | message "${message}" published to exchange "${USER_EXCHENGE}"`);
// }

// export async function sendMessageFromEventToTicket(message: string) {
//     // Publish message to the exchange
//     await eventChannel.publish(TICKET_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher Event >>> | message "${message}" published to exchange "${TICKET_EXCHENGE}"`);
// }

// export async function sendMessageFromEventToUserHistory(message: string) {
//     // Publish message to the exchange
//     await eventChannel.publish(USER_HISTORY_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher >>> | message "${message}" published to exchange "${USER_HISTORY_EXCHENGE}"`);
// }

// export function getEventChannel() {
//     return eventChannel;
// }


// export function getRatingChannel() {
//     return ratingChannel;
// }



// Close RabbitMQ channel and connection
function closeRabbitMQConnection() {
    // if (eventChannel) {
    //     eventChannel.close();
    // }
    // if (ratingChannel) {
    //     ratingChannel.close();
    // }
    if (channel) {
        channel.close();
    }
    if (rabbitMQConnection) {
        rabbitMQConnection.close();
    }
}

// Cleanup function to be called on server shutdown
async function cleanup() {
    console.log('Cleaning up resources...');
    // Close RabbitMQ connection
    await closeRabbitMQConnection();
    console.log('Cleanup completed.');
}

// Handle server shutdown
process.on('SIGINT', async () => {
    console.log('Server shutting down...');
    await cleanup();
    process.exit(0);
});