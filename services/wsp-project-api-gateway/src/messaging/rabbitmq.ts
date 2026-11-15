import * as amqp from 'amqplib';
import * as dotenv from 'dotenv';
import { USER_EXCHENGE, USER_QUEUE, EVENT_EXCHENGE, GATEWAY_EXCHENGE, GATEWAY_QUEUE, TICKET_EXCHENGE, RATING_CREATED_ACTION, UPDATE_CLOSEST_EVENT_ACTION, PROJECT_EXCHANGE, USER_ORDERED_EVENT_ACTION } from '../consts';
import { increaseUserRatingCounter, updateSingleUserClosetEvent } from '../controllers/userControllers';

dotenv.config();

let rabbitMQConnection: amqp.Connection;
// let userChannel: amqp.Channel;
// let gatewayChannel: amqp.Channel;

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


// // Function to create a channel on the RabbitMQ connection
// export async function createChannels() {
//     try {
//         rabbitMQConnection = await amqp.connect(`amqps://tlncafeu:${process.env.RABBITMQPASS}@cow.rmq2.cloudamqp.com/tlncafeu`);
//         // Create channels for different exchanges
//         userChannel = await rabbitMQConnection.createChannel();
//         gatewayChannel = await rabbitMQConnection.createChannel(); 
        
//         // Declare exchanges on respective channels
//         await userChannel.assertExchange(USER_EXCHENGE, 'fanout', { durable: false });
//         await gatewayChannel.assertExchange(GATEWAY_EXCHENGE, 'fanout', { durable: false });

//         console.log('RabbitMQ channels created');
//     } catch (error) {
//         console.error('Error creating channels:', error);
//         throw error; // Rethrow the error for handling by the caller
//     }
// }


export async function consumeMessages() {
    // Assert queues
    // await userChannel.assertQueue(USER_QUEUE, {durable: false});
    // await gatewayChannel.assertQueue(GATEWAY_QUEUE, {durable: false});
    await channel.assertQueue(USER_QUEUE, {durable: false});
    // await channel.assertQueue('temp_user_queue', {durable: false});
    // Bind queues to exchanges
    // await userChannel.bindQueue(USER_QUEUE, USER_EXCHENGE, '');
    // await gatewayChannel.bindQueue(GATEWAY_QUEUE, GATEWAY_EXCHENGE, '');
    await channel.bindQueue(USER_QUEUE, PROJECT_EXCHANGE, '');
    // await channel.bindQueue('temp_user_queue', PROJECT_EXCHANGE, '');

    // Consume messages
    channel.consume(USER_QUEUE, (msg) => {
        if (msg) {
            const {action, data} = JSON.parse(msg.content.toString());
            console.log(`Received message for User: ${msg.content.toString()}`);
            switch (action) {
                case RATING_CREATED_ACTION:
                    increaseUserRatingCounter(data);
                    break;
                // case UPDATE_CLOSEST_EVENT_ACTION:
                //     updateSingleUserClosetEvent(data);
                //     break;
                case USER_ORDERED_EVENT_ACTION:
                    updateSingleUserClosetEvent(data);
                    break;
                default:
                    console.log('User received Unknown action:', action);
                    break;
            }
            channel.ack(msg);
        }
    });

    // channel.consume('temp_user_queue', (msg) => {
    //     if (msg) {
    //         const {action, data} = JSON.parse(msg.content.toString());
    //         console.log(`Received message for User: ${msg.content.toString()}`);
    //         switch (action) {
    //             case RATING_CREATED_ACTION:
    //                 increaseUserRatingCounter(data);
    //                 break;
    //             // case UPDATE_CLOSEST_EVENT_ACTION:
    //             //     updateSingleUserClosetEvent(data);
    //             //     break;
    //             case USER_ORDERED_EVENT_ACTION:
    //                 updateSingleUserClosetEvent(data);
    //                 break;
    //             default:
    //                 console.log('User received Unknown action:', action);
    //                 break;
    //         }
    //         channel.ack(msg);
    //     }
    // });

    

    // userChannel.consume(USER_QUEUE, (msg) => {
    //     if (msg) {
    //         const {action, data} = JSON.parse(msg.content.toString());
    //         console.log(`Received message for User: ${msg.content.toString()}`);
    //         switch (action) {
    //             case RATING_CREATED_ACTION:
    //                 increaseUserRatingCounter(data);
    //                 break;
    //             case UPDATE_CLOSEST_EVENT_ACTION:
    //                 updateUsersClosestEvent(data);
    //                 break;
    //             default:
    //                 console.log('User received Unknown action:', action);
    //                 break;
    //         }
    //         userChannel.ack(msg);
    //     }
    // });

    // gatewayChannel.consume(GATEWAY_QUEUE, (msg) => {
    //     if (msg !== null) {
    //         console.log(`Received message for rating: ${msg.content.toString()}`);
    //         gatewayChannel.ack(msg);
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


// export async function sendMessageFromGWToTicket(message: string) {
//     // Publish message to the exchange
//     await gatewayChannel.publish(TICKET_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher gateway >>> | message "${message}" published to exchange "${TICKET_EXCHENGE}"`);
// }


// export async function sendMessageToRating(message: string) {
//     // Publish message to the exchange
//     await ratingChannel.publish(RATING_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher >>> | message "${message}" published to exchange "${RATING_EXCHENGE}"`);
// }

// export async function sendMessageToTicket(message: string) {
//     // Publish message to the exchange
//     await userChannel.publish(TICKET_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher >>> | message "${message}" published to exchange "${TICKET_EXCHENGE}"`);

// }

// export function getEventChannel() {
//     return userChannel;
// }


// export function getRatingChannel() {
//     return ratingChannel;
// }



// Close RabbitMQ channel and connection
function closeRabbitMQConnection() {
    // if (userChannel) {
    //     userChannel.close();
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