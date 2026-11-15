import * as amqp from 'amqplib';
import * as dotenv from 'dotenv';
import {
    DELETE_TICKETS_BY_EVENT_ID_ACTION,
    ORDER_QUEUE,
    PROJECT_EXCHANGE,
    TICKET_QUEUE,
} from '../consts';
import { deleteTicktsByEventId } from '../controllers/ticketController';
// import {createEventTickets} from "../controllers/ticketController";

dotenv.config();

let rabbitMQConnection: amqp.Connection;
// let ticketChannel: amqp.Channel;
// let orderChannel: amqp.Channel;

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
//         ticketChannel = await rabbitMQConnection.createChannel();
//         orderChannel = await rabbitMQConnection.createChannel();

//         // Declare exchanges on respective channels
//         await ticketChannel.assertExchange(TICKET_EXCHENGE, 'fanout', { durable: false });
//         await orderChannel.assertExchange(ORDER_EXCHENGE, 'fanout', { durable: false });

//         console.log('RabbitMQ channels created');
//     } catch (error) {
//         console.error('Error creating channels:', error);
//         throw error; // Rethrow the error for handling by the caller
//     }
// }


export async function consumeMessages() {
    // Assert queues
    // await ticketChannel.assertQueue(TICKET_QUEUE, {durable: false});
    // await orderChannel.assertQueue(ORDER_QUEUE, {durable: false});
    // await channel.assertQueue(TICKET_QUEUE, {durable: false});
    await channel.assertQueue(ORDER_QUEUE, {durable: false});

    // Bind queues to exchanges
    // await ticketChannel.bindQueue(TICKET_QUEUE, TICKET_EXCHENGE, '');
    // await orderChannel.bindQueue(ORDER_QUEUE, ORDER_EXCHENGE, '');
    await channel.bindQueue(TICKET_QUEUE, PROJECT_EXCHANGE, '');

    // // Consume messages
    // await ticketChannel.consume(TICKET_QUEUE, (msg) => {
    //     if (msg) {
    //         const {action, data} = JSON.parse(msg.content.toString());
    //         console.log(`Received message for Ticket: ${msg.content.toString()}`);
    //         switch (action) {
    //             case EVENT_CREATED_ACTION:
    //                 createEventTickets(data)
    //                 break;
    //             default:
    //                 console.log('Unknown message received in Ticket consumer: ', action);
    //         }
    //         // Acknowledge message processing
    //         ticketChannel.ack(msg);
    //     }
    // });

    // // Consume messages
    await channel.consume(TICKET_QUEUE, (msg) => {
        if (msg !== null) {
            const {action, data} = JSON.parse(msg.content.toString());
            console.log(`Received message for Ticket: ${msg.content.toString()}`);
            switch (action) {
                case DELETE_TICKETS_BY_EVENT_ID_ACTION:
                    deleteTicktsByEventId(data);
                    break;
                default:
                    console.log('Unknown message received in Ticket consumer: ', action);
            }
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


// export async function sendMessageToTicket(message: string) {
//     // Publish message to the exchange
//      orderChannel.publish(TICKET_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher Order >>> | message "${message}" published to exchange "${TICKET_EXCHENGE}"`);
// }


// export async function sendMessageToOrder(message: string) {
//     // Publish message to the exchange
//      ticketChannel.publish(ORDER_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher Ticket >>> | message "${message}" published to exchange "${ORDER_EXCHENGE}"`);
// }

// export async function sendMessageToUserHistory(message: string) {
//     // Publish message to the exchange
//     orderChannel.publish(USER_HISTORY_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher Order >>> | message "${message}" published to exchange "${USER_HISTORY_EXCHENGE}"`);
// }


// export const sendMessageToService = (message: string, exchange : string) => {
//     // Publish message to the exchange
//     orderChannel.publish(exchange, '', Buffer.from(message));
//     console.log(`Publisher Order >>> | message "${message}" published to exchange "${exchange}"`);
// }

// export async function sendMessageFromTicketToEvent(message: string){
//     ticketChannel.publish(EVENT_EXCHENGE, '', Buffer.from(message));
//     console.log(`Publisher Ticket >>> | message "${message}" published to exchange "${EVENT_EXCHENGE}"`);
// }


// export function getTicketChannel() {
//     return ticketChannel;
// }

// export function getOrderChannel() {
//     return orderChannel;
// }



// Close RabbitMQ channel and connection
function closeRabbitMQConnection() {
    // if (orderChannel) {
    //     orderChannel.close();
    // }
    // if (ticketChannel) {
    //     ticketChannel.close();
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