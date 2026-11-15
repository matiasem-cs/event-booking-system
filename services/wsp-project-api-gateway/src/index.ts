import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import { createChannel, consumeMessages } from './messaging/rabbitmq.js';
import gatewayRoutes from './routes/gatewayRoutes.js';

// Load environment variables from .env file
dotenv.config();

/* connect to mongoDB*/
const dbURI = `mongodb+srv://yogawithmatias:${process.env.DBPASS}@cluster0.zw9v1gd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const connectToMongoDB = async () => {
    await mongoose.connect(dbURI);
};
  
connectToMongoDB();

const port = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin:true, credentials: true }));

// Routes
app.use('/api', userRoutes);
app.use('/api', gatewayRoutes);

const connectToRabbitMQ = async () => {
    await createChannel();
    // start consuming messages
    consumeMessages();
};
  
connectToRabbitMQ();

app.listen(port, () => {
    console.log(`Server running! port ${port}`);
});
