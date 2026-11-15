import * as mongoose from "mongoose";


export interface OrderModel extends Document {
    event_id: string;
    user_id: string;
    ticket_id: string;
    ticket_type: string;
    datePurchased: Date;
    // purchaseTimeout: Date;
    quantity_purchased: number;
    total_cost: number;
    paymentStatus: 'pending' | 'approved' | 'failure' | 'waiting_payment' | 'waiting_payment_overtime';
}

const orderSchema = new mongoose.Schema<OrderModel>(
    {
        user_id: { type: String, required: true, minlength: 1 },
        event_id: { type: String, required: true, minlength: 1 },
        ticket_id: {type: String, required: true, minlength: 1},
        ticket_type: {type: String, required: true, minlength: 1},
        datePurchased: {
            type: Date,
            required: true,
            match: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
            message: 'Invalid purchase date format'
        },
        quantity_purchased: {type: Number, required: true, min: 1 },
        total_cost: {type: Number, required: true, min: 0 },
        // purchaseTimeout: { type: Date, required: true },
        paymentStatus: {
            type: String,
            enum: ['pending', 'approved', 'failure', 'waiting_payment', 'waiting_payment_overtime'],
            default: 'pending'
        }
    }
);

export default mongoose.model("WSP-Project-Order", orderSchema);