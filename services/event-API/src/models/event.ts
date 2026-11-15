import mongoose, { Schema, Document } from 'mongoose';
import { EventCategory } from '../consts';

// Define interface for Event document
interface IEvent extends Document {
  title: string;
  category: string;
  description: string;
  location: string;
  organizer: string;
  start_date: Date;
  end_date: Date;
  img: string;
  comment_count: number;
  rating: number;
  lowest_price_available: number;
  quantity_available: number;
}

// Define schema for Event document
const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true , min: 1 },
  category: { type: String, required: true, enum: Object.values(EventCategory) },
  description: { type: String, required: true, min: 1 },
  location: { type: String, required: true , min: 1 },
  organizer: { type: String, required: true, min: 1 },
  start_date: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(this: IEvent, startDate: Date) {
        return startDate > new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  end_date: { 
    type: Date, 
    required: true, 
    validate: {
      validator: function(this: IEvent, endDate: Date) {
        return endDate > this.start_date;
      },
      message: 'End date must be after start date'
    },
  },
  img: { type: String, required: true },
  comment_count: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  lowest_price_available: { type: Number, required: true, min: 0},
  quantity_available: { type: Number, required: true , min: 0}
});

// Create and export the Event model
export default mongoose.model<IEvent>('WSP-Project-Event', eventSchema);