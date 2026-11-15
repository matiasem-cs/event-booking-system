import { Request, Response } from 'express';
import Rating, { RatingModel } from '../models/rating.js';

export const createRating = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body);
    // create a new rating
    const { event_id, user_id, rating } = req.body;
    let newRating = new Rating({ event_id, user_id, rating });
    try {
      await newRating.validate();
    }
    catch (error) {
      res.status(400).json({ message: 'Invalid rating' });
      return;
    }

    await newRating.save();
    res.status(201).json({ message: 'Rating created successfully', rating: newRating });
  } catch (error) {
    res.status(500).json({ message: 'Server Error - :(' });
  }
};

export const updateRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating } = req.body;
    const ratingID = req.params.id;
    await Rating.findByIdAndUpdate(ratingID, { rating });
    res.status(200).json({ message: 'Rating updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Controller to update a rating by event ID and user ID
export const updateRatingByEventAndUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, userId } = req.params;
    const { rating } = req.body;

    // Validate request body
    if (!rating) {
      res.status(400).json({ message: 'Rating is required' });
      return;
    }
    const event_id = eventId;
    const user_id = userId;

    const updatedRating: RatingModel | null = await Rating.findOneAndUpdate(
      { event_id, user_id },
      { rating },
      { new: true }
    );

    if (!updatedRating) {
      res.status(404).json({ message: 'Rating not found' });
      return;
    }

    res.status(200).json({ message: 'Rating updated successfully', rating: updatedRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Controller to get ratings by event ID
export const getRatingsByEventId = async (req: Request, res: Response): Promise<void> => {
  try {
    const event_id: string = req.params.eventId;
    const ratings: RatingModel[] = await Rating.find({ event_id });
    res.status(200).json({ ratings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Controller to get ratings by user ID
export const getRatingsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id: string = req.params.userId;
    const ratings: RatingModel[] = await Rating.find({ user_id });
    res.status(200).json({ ratings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Controller to get rating by event ID and user ID (like JOIN)
export const getRatingByEventAndUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, userId } = req.params;
    const event_id = eventId;
    const user_id = userId;
    const rating: RatingModel | null = await Rating.findOne({ event_id, user_id });
    if (!rating) {
      res.status(404).json({ message: 'Rating not found' });
    } else {
      res.status(200).json({ rating });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};