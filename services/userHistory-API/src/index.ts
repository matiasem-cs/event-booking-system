import express, { Application } from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import userHistoryRoutes from "./routes/userHistoryRoutes"; // Import the consumeMessages function
import {createChannel, consumeMessages} from "./messaging/rabbitmq";


// Load environment variables from .env file
dotenv.config();
const port = process.env.PORT || 3004;

/* connect to mongoDB*/
// const dbURI = `mongodb+srv://brlilonadav:${process.env.DBPASS}@cluster0.tzeo2jo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const dbURI = `mongodb+srv://yogawithmatias:${process.env.DBPASS}@cluster0.zw9v1gd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Connect to MongoDB Atlas
const connectToMongoDB = async () => {
    await mongoose.connect(dbURI);
};

connectToMongoDB();

const app: Application = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', userHistoryRoutes);


// Connect to RabbitMQ
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