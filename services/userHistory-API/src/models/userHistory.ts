import * as mongoose from "mongoose";
// import {Schema} from "mongoose";
// import {UserPermission} from "../consts";

interface Ticket {
    name: string;
    quantity: number;
    // removed price because - didn't say we need
}

interface OrderModel extends Document {
    event_id: string;
    user_id: string;
    totalCost: number;
    datePurchased: Date;
    tickets : Ticket;
    timestamp: Date;
}

interface EventModel {
    title: string;
    category: string;
    location: string;
    organizer: string;
    start_date: Date;
    end_date: Date;
    img: string;
}


export interface UserHistoryModel extends Document {
    user_id: string;
    event_id: string
    event_details: EventModel;
    order_details: OrderModel[];

}

const userHistorySchema = new mongoose.Schema<UserHistoryModel>({
    user_id: { type: String, required: true, min: 1 },
    event_id: { type: String, required: true, min: 1 },
    event_details: {
        title: { type: String, required: true, min: 1 },
        category: { type: String, required: true, min: 1 },
        location: { type: String, required: true, min: 1 },
        organizer: { type: String, required: true, min: 1 },
        start_date: { type: Date, required: true },
        end_date: {
            type: Date,
            required: true,
            validate: {
                validator: function (endDate: Date) {
                    return endDate > this.event_details.start_date; // Compare with start_date
                },
                message: 'End date must be after Start date'
            }
        },
        img: { type: String, required: true, min: 1 },
        rating: { type: Number, default: 0 },
    },
    order_details:
        [
            {
                totalCost: { type: Number, required: true, min: 1 },
                datePurchased: {
                    type: Date,
                    required: true,
                    match: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
                    message: 'Invalid purchase date format'
                },
                tickets: {
                    name: { type: String, required: true, min: 1 },
                    quantity: { type: Number, required: true, min: 0 }
                }
            }
        ]
});

userHistorySchema.index({ user_id: 1, event_id: 1 }, { unique: true });


export default mongoose.model("WSP-Project-UserHistory", userHistorySchema);