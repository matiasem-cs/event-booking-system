import * as mongoose from "mongoose";

export interface RatingModel extends Document {
    eventID: string;
    userID: string;
    rating: number;
    timestamp: Date;
}

const ratingSchema = new mongoose.Schema
(
    {
        event_id: {type : String, required: true},
        user_id: {type : String, required: true},
        rating: {type : Number, required: true, min: 1, max: 5},
    }
);

export default mongoose.model("Rating", ratingSchema);