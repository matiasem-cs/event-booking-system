import * as amqp from 'amqplib';
import * as dotenv from 'dotenv';
import {
    PROJECT_EXCHANGE,
    USER_HISTORY_EXCHENGE,
    USER_HISTORY_QUEUE,
} from '../consts';
import {messageHandler} from "../controllers/userHistoryController";

dotenv.config();

let rabbitMQConnection: amqp.Connection;
// let userHistoryChannel: amqp.Channel;
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
//         const connection = await amqp.connect(`amqps://tlncafeu:${process.env.RABBITMQPASS}@cow.rmq2.cloudamqp.com/tlncafeu`);
//         // Create channels for different exchanges
//         userHistoryChannel = await connection.createChannel();

//         // Declare exchanges on respective channels
//         await userHistoryChannel.assertExchange(USER_HISTORY_EXCHENGE, 'fanout', { durable: false });

//         console.log('RabbitMQ channels created');
//     } catch (error) {
//         console.error('Error creating channels:', error);
//         throw error; // Rethrow the error for handling by the caller
//     }
// }


export async function consumeMessages() {
    // Assert queues
    // await userHistoryChannel.assertQueue(USER_HISTORY_QUEUE, {durable: false});
    await channel.assertQueue(USER_HISTORY_QUEUE, {durable: false});

    // Bind queues to exchanges
    // await userHistoryChannel.bindQueue(USER_HISTORY_QUEUE, USER_HISTORY_EXCHENGE, '');
    await channel.bindQueue(USER_HISTORY_QUEUE, PROJECT_EXCHANGE, '');

    // // Consume messages
    // await userHistoryChannel.consume(USER_HISTORY_QUEUE, (msg) => {
    //     if (msg !== null) {
    //         const message = JSON.parse(msg.content.toString())

    //         // Route message to appropriate controller based on message content
    //         messageHandler(message.action, message.data)

    //         // Acknowledge message processing
    //         userHistoryChannel.ack(msg);
    //     }
    // });

    await channel.consume(USER_HISTORY_QUEUE, (msg) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString())
            console.log(`Received message for User History: `,message);

            // Route message to appropriate controller based on message content
            messageHandler(message.action, message.data)

            // Acknowledge message processing
            channel.ack(msg);
        }
    });
}


export async function sendMessage(message: string, service: string) {
    if (!channel) {
        channel = await rabbitMQConnection.createChannel();
    }
    // Publish message to the exchange
    await channel.publish(PROJECT_EXCHANGE, '', Buffer.from(message));
    console.log(`Publisher ${service} >>> | message "${message}" published to exchange "${PROJECT_EXCHANGE}"`);
}


// export const sendMessageToService = async (message: string, exchange : string) => {
//     // Publish message to the exchange
//     userHistoryChannel.publish(exchange, '', Buffer.from(message));
//     console.log(`Publisher >>> | message "${message}" published to exchange "${exchange}"`);
// }


// export function getUserHistoryChannel() {
//     return userHistoryChannel;
// }

// Close RabbitMQ channel and connection
function closeRabbitMQConnection() {
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