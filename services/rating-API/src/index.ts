import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import ratingRoutes from './routes/RatingRoutes.js';

// Load environment variables from .env file
dotenv.config();
const port = process.env.PORT || 3000;

/* connect to mongoDB*/
const dbURI = `mongodb+srv://yogawithmatias:${process.env.DBPASS}@cluster0.zw9v1gd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const app: Application = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', ratingRoutes);

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error.stack);
  console.log("inside error handling middleware");
  res.status(500).json({ message: 'Server Error' });
});



// Connect to MongoDB Atlas
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as mongoose.ConnectOptions); // Add 'as mongoose.ConnectOptions' to specify the correct type
        console.log('Connected to MongoDB Atlas');
        app.listen(3000, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
};

connectToMongoDB();