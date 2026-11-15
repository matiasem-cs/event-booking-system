import * as mongoose from "mongoose";


export interface TicketModel extends Document {
    event_id: string;
    name: string;
    quantity_available: number;
    price : number;
}

const ticketSchema = new mongoose.Schema<TicketModel>(
    {
        event_id: { type: String, required: true, min: 1 },
        name: { type: String, required: true, min: 1 },
        quantity_available: {type: Number, required: true, min: 0},
        price: {type: Number, required: true, min: 0},
    }
);

export default mongoose.model("WSP-Project-Ticket", ticketSchema);