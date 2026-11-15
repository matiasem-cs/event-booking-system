import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import eventRoutes from './routes/eventRoutes';
import ratingRoutes from './routes/ratingRoutes';
import { createChannel, consumeMessages } from './messaging/rabbitmq';

// Load environment variables from .env file
dotenv.config();
const port = process.env.PORT || 3001;

/* connect to mongoDB*/
const dbURI = `mongodb+srv://yogawithmatias:${process.env.DBPASS}@cluster0.zw9v1gd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const connectToMongoDB = async () => {
  await mongoose.connect(dbURI);
};

connectToMongoDB();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', eventRoutes);
app.use('/api', ratingRoutes);


const connectToRabbitMQ = async () => {
  await createChannel();
  // start consuming messages
  consumeMessages();
};

connectToRabbitMQ();

// Start server
app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
