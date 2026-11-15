import { Request, Response } from 'express';
import Event from '../models/event.js';
import { sendMessage } from '../messaging/rabbitmq.js';
import Rating, { RatingModel } from '../models/rating.js';
import { EVENT_UPDATED_DATE_ACTION } from '../consts.js';

// Get all events
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    // Parse pagination parameters from the request query
    const { skip = 0, limit = 10 } = req.query;

    console.log('in event-api at getEvents');
    // Define the projection to exclude certain fields
    const projection = {
      description: 0,
      organizer: 0,
      location: 0,
      end_date: 0
    };    
    // Fetch events from MongoDB with pagination and projection
    const events = await Event.find({}, projection)
                               .skip(+skip) // Convert skip to a number
                               .limit(+limit); // Convert limit to a number

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events with quantity available
export const getAllEventsWithTicketsAvailable = async (req: Request, res: Response) => {
  try {
    // Parse pagination parameters from the request query
    const { skip = 0, limit = 10 } = req.query;

    console.log('in event-api at getEventsWithQuantityAvailable');
    // Define the projection to exclude certain fields
    const projection = {
      description: 0,
      organizer: 0,
      location: 0,
      end_date: 0
    };

    const currentDate = new Date();
    const start_date_condition = { start_date: { $gt: currentDate } };

    const query = { quantity_available: { $gt: 0 }, ...start_date_condition };

    // Fetch events from MongoDB with pagination and projection
    const events = await Event.find(query, projection)
                   .skip(+skip) // Convert skip to a number
                   .limit(+limit); // Convert limit to a number
    // // Fetch events from MongoDB with pagination and projection
    // const events = await Event.find({quantity_available: {$gt: 0}}, projection)
    //                            .skip(+skip) // Convert skip to a number
    //                            .limit(+limit); // Convert limit to a number

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events by sorted by lowest-price-available
export const getEventsByLowestPrice = async (req, res) => {
  try {
      const { skip = 0, limit = 10 } = req.query;

      const projection = {
        description: 0,
        organizer: 0,
        location: 0,
        end_date: 0
      }; 

      const currentDate = new Date();
      const start_date_condition = { start_date: { $gt: currentDate } };
      const query = { quantity_available: { $gt: 0 }, ...start_date_condition };

      const events = await Event.find(query, projection)
                                .sort({ lowest_price_available: 1 })
                                .skip(+skip)
                                .limit(+limit);
      res.status(200).json(events);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Get all events by price range with quantity available
export const getEventsByPriceRange = async (req: Request, res: Response) => {
  try {
      const { fromPrice = 0, toPrice = Infinity , skip = 0, limit = 10 } = req.query;

      const projection = {
        description: 0,
        organizer: 0,
        location: 0,
        end_date: 0
      }; 
      const currentDate = new Date();
      const start_date_condition = { start_date: { $gt: currentDate } };
      const query = { quantity_available: { $gt: 0 }, lowest_price_available: { $gte: +fromPrice, $lte: +toPrice } , ...start_date_condition };

      const events = await Event.find(query, projection)
      .sort({ lowest_price_available: 1 })
      .skip(+skip)
      .limit(+limit);

      res.status(200).json(events);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Get all events by price range with quantity available and sorted by lowest-price-available
export const getEventsByPriceRangeSorted = async (req: Request, res: Response) => {
  try {
      const { fromPrice, toPrice, skip = 0, limit = 10 } = req.query;

      const projection = {
        description: 0,
        organizer: 0,
        location: 0,
        end_date: 0
      }; 

      const currentDate = new Date();
      const start_date_condition = { start_date: { $gt: currentDate } };
      const query = { quantity_available: { $gt: 0 }, lowest_price_available: { $gte: +fromPrice, $lte: +toPrice } , ...start_date_condition };

      const events = await Event.find(query, projection)
      .sort({ lowest_price_available: 1 })
      .skip(+skip)
      .limit(+limit);

      res.status(200).json(events);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Get event by id
export const getEvent = async (req: Request, res: Response) => {
  try {
    console.log('in event-api at getEvent by id');
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/***
 * create event:
 * Gateway -> Event -> Catalog-Event
 * 
 */

// Create event
export const createEvent = async (req: Request, res: Response) => {
  console.log('in event-api at createEvent');
  // Regular expression pattern for date format YYYY-MM-DDTHH:mm
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

  // Format validation for start_date
  if (!dateFormatRegex.test(req.body.start_date)) {
    return res.status(400).json({ message: 'Invalid start_date format. Please use YYYY-MM-DDTHH:mm format' });
  }

  // Format validation for end_date
  if (!dateFormatRegex.test(req.body.end_date)) {
    return res.status(400).json({ message: 'Invalid end_date format. Please use YYYY-MM-DDTHH:mm format' });
  }

  // Check if start_date is in the future
  const startDate = new Date(req.body.start_date);
  if (startDate <= new Date()) {
    return res.status(400).json({ message: 'Start date must be in the future' });
  }

  // Check if end_date is in the future and after start_date
  const endDate = new Date(req.body.end_date);
  if (endDate <= new Date() || endDate <= startDate) {
    return res.status(400).json({ message: 'End date must be in the future and after start date' });
  }
  const event = new Event({
    title: req.body.title,
    category: req.body.category,
    description: req.body.description,
    location: req.body.location,
    organizer: req.body.organizer,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    tickets: req.body.tickets,
    img: req.body.img,
    comment_count: req.body.comment_count,
    rating: req.body.rating,
    lowest_price_available: req.body.lowest_price_available,
    quantity_available: req.body.quantity_available
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateEventDates = async (req: Request, res: Response) => {
  try {
    const eventDataToUpdate = req.body;

    let newStartDate, newEndDate;

    if (!eventDataToUpdate.start_date) {
      return res.status(400).json({ message: 'start_date is required' });
    }

    if (!eventDataToUpdate.end_date) {
      return res.status(400).json({ message: 'end_date is required' });
    }

    // get existing event
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the event has already started
    if (existingEvent.start_date <= new Date()) {
      return res.status(400).json({ message: 'Event start date has passed, cannot update dates' });
    }

    // Regular expression pattern for date format YYYY-MM-DDTHH:mm
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    // Format validation for start_date
    if (!dateFormatRegex.test(req.body.start_date)) {
      return res.status(400).json({ message: 'Invalid start_date format. Please use YYYY-MM-DDTHH:mm format' });
    }

    // Format validation for end_date
    if (!dateFormatRegex.test(req.body.end_date)) {
      return res.status(400).json({ message: 'Invalid end_date format. Please use YYYY-MM-DDTHH:mm format' });
    }

    // console.log('current date:', new Date());

    if (eventDataToUpdate.start_date){
      newStartDate = new Date(eventDataToUpdate.start_date)
      // console.log('newStartDate: ', newStartDate);
    }
    if (eventDataToUpdate.end_date){
      newEndDate = new Date(eventDataToUpdate.end_date)
      // console.log('newEndDate: ', newEndDate);
    }


    if (newStartDate && newStartDate <= existingEvent.start_date) {
      return res.status(400).json({ message: 'Start date cannot be earlier than or equal to the current start date' });
    }

    if (newStartDate && newEndDate && newEndDate <= newStartDate) {
      return res.status(400).json({ message: 'End date cannot be earlier than or equal to the start date' });
    }

    if (!newStartDate && newEndDate && newEndDate <= existingEvent.start_date) {
      return res.status(400).json({ message: 'End date cannot be earlier than or equal to the existing start date' });
    }

    if (newEndDate && newEndDate < existingEvent.end_date) {
      return res.status(400).json({ message: 'End date cannot be earlier than the current end date' });
    }

    Object.assign(existingEvent, eventDataToUpdate);

    const updatedEvent = await existingEvent.save();

    let message = {
      action: EVENT_UPDATED_DATE_ACTION,
      data: {
        event_id: updatedEvent._id,
        start_date: updatedEvent.start_date,
        end_date: updatedEvent.end_date
      }
    };
    await sendMessage(JSON.stringify(message), 'Event');
    // await sendMessageFromEventToUserHistory(JSON.stringify(message));

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}


export const updateEventExistingRating = async (data: any) => {
  try {
    console.log('in updateEventExistingRating data: ', data);
    const rating = data;

    const event = await Event.findById({_id: rating.event_id});
    if (!event) {
      console.log('Bad Error: created rating for Event but Event was not found, Cant update rating');
      return;
    }
    const ratings: RatingModel[] = await Rating.find({ event_id: rating.event_id });
    let totalRating = 0;
    ratings.forEach((rating) => {
      totalRating += rating.rating;
    });
    event.rating = totalRating / ratings.length;
    await event.save();
  } catch (error) {
    console.log(error);
  }
}


export const updateEventLowestPriceAndQuantityAvailable = async (data: any) => {
  try {
    console.log('in updateEventLowestPriceAndQuantityAvailable');
    let {event_id, lowest_price_available, quantity_available} = data;
    const event = await Event.findById(event_id);
    if (!event) {
      console.log('Event not found, Cant update lowest price and quantity available'); 
      return;
    }
    event.lowest_price_available = lowest_price_available;
    event.quantity_available = quantity_available;
    await event.save();
  } catch (error) {
    console.log('error in updateEventLowestPriceAndQuantityAvailable: ',error);
  }
}

export const decreaseEventQntityAvailable = async (data: any) => {
  try {
    let {event_id, quantity_purchased} = data;
    const event = await Event.findById(event_id);
    if (!event) {
      return;
    }
    event.quantity_available -= quantity_purchased;
    await event.save();
  } catch (error) {
    console.log(error);
  }
}


export const increaseEventQntityAvailable = async (data: any) => {
  try {
    let {event_id, quantity_purchased} = data;
    const event = await Event.findById(event_id);
    if (!event) {
      return;
    }
    event.quantity_available += quantity_purchased;
    await event.save();
  } catch (error) {
    console.log(error);
  }
}


export const increaseEventCommentCount = async (data: any) => {
  try {
    let {event_id} = data;
    const event = await Event.findById(event_id);
    if (!event) {
      console.log('Event not found, Cant increase comment count');
      return;
    }
    event.comment_count += 1;
    await event.save();
  } catch (error) {
    console.log(error);
  }
}


export const updateLowestPriceAvailable = async (data: any) => {
  try {
    console.log('in updateLowestPriceAvailable')
    let {event_id, lowestPrice} = data;
    const event = await Event.findById(event_id);
    if (!event) {
      return;
    }
    console.log('event: ', event);
    console.log('lowestPrice: ', lowestPrice);
    event.lowest_price_available = lowestPrice;
    await event.save();
  } catch (error) {
    console.log(error);
  }
}

export const deleteEventById = async (data: any) => {
  try {
    const {event_id} = data;
    
    const event = await Event.findById(event_id);
    if (!event) {
      return;
    }

    await Event.deleteOne({ _id: event._id });
  } catch (error) {
    console.log(error);
  }
}