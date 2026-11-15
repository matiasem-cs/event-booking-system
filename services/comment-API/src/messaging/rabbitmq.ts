import * as amqp from 'amqplib';
import * as dotenv from 'dotenv';
import {
    PROJECT_EXCHANGE,
    // COMMENT_EXCHANGE,
} from '../consts';

dotenv.config();

let rabbitMQConnection: amqp.Connection;
// let commentChannel: amqp.Channel;

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
//         const rabbitMQConnection = await amqp.connect(`amqps://tlncafeu:${process.env.RABBITMQPASS}@cow.rmq2.cloudamqp.com/tlncafeu`);
//         // Create channels for different exchanges
//         commentChannel = await rabbitMQConnection.createChannel();

//         // Declare exchanges on respective channels
//         await commentChannel.assertExchange(COMMENT_EXCHANGE, 'fanout', { durable: false });

//         console.log('RabbitMQ channels created');
//     } catch (error) {
//         console.error('Error creating channels:', error);
//         throw error; // Rethrow the error for handling by the caller
//     }
// }


// export async function consumeMessages() {
//     // Assert queues
//     await commentChannel.assertQueue(COMMENT_QUEUE, {durable: false});

//     // Bind queues to exchanges
//     await commentChannel.bindQueue(COMMENT_QUEUE, COMMENT_EXCHANGE, '');

//     // Consume messages
//     await commentChannel.consume(COMMENT_QUEUE, (msg) => {
//         if (msg !== null) {
//             console.log(`Received message for Comment: ${msg.content.toString()}`);
//             commentChannel.ack(msg);
//         }
//     });
// }




export async function sendMessage(message: string, service: string) {
    if (!channel) {
        channel = await rabbitMQConnection.createChannel();
    }
    // Publish message to the exchange
    await channel.publish(PROJECT_EXCHANGE, '', Buffer.from(message));
    console.log(`Publisher ${service} >>> | message "${message}" published to exchange "${PROJECT_EXCHANGE}"`);
}



// export const sendMessageToService = (message: string, exchange : string) => {
//     // Publish message to the exchange
//     commentChannel.publish(exchange, '', Buffer.from(message));
//     console.log(`Publisher >>> | message "${message}" published to exchange "${exchange}"`);
// }


// export function getCommentChannel() {
//     return commentChannel;
// }



// Close RabbitMQ channel and connection
function closeRabbitMQConnection() {
    // if (commentChannel) {
    //     commentChannel.close();
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