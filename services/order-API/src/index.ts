import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import orderRoutes from './routes/orderRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import {createChannel, consumeMessages} from "./messaging/rabbitmq";

// Load environment variables from .env file
dotenv.config();
const port = process.env.PORT || 3002;

/* connect to mongoDB*/
const dbURI = `mongodb+srv://yogawithmatias:${process.env.DBPASS}@cluster0.zw9v1gd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const dbURI = `mongodb+srv://brlilonadav:${process.env.DBPASS}@cluster0.tzeo2jo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const connectToMongoDB = async () => {
  await mongoose.connect(dbURI);
};

connectToMongoDB();

const app: Application = express();


// Middleware
app.use(express.json());

// Routes
app.use('/api', orderRoutes, ticketRoutes);

const connectToRabbitMQ = async () => {
  await createChannel();
  // start consuming messages
  await consumeMessages();
};

connectToRabbitMQ();


// Start server
app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
