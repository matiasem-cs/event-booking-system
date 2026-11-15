import mongoose, { Document } from 'mongoose';

// Define interface for Rating document
export interface RatingModel extends Document {
    event_id: string;
    user_id: string;
    rating: number;
}

// Define schema for Rating document
const ratingSchema = new mongoose.Schema
(
    {
        event_id: {type : String, required: true},
        user_id: {type : String, required: true},
        rating: {type : Number, required: true, min: 1, max: 5},
    }
);

export default mongoose.model("WSP-Project-Rating", ratingSchema);