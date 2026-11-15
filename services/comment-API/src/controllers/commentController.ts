import { Request, Response } from 'express';
import Comment, {CommentModel} from '../models/comment.js';
import {COMMENT_CREATED_ACTION, RabbitMQMessage} from "../consts";
import xss from 'xss';
import {sendMessage} from "../messaging/rabbitmq";

export const createComment = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("creating comment...")

        // create a new comment
        const { event_id, author, content } = req.body;

        // sanitize user input
        const sanitizedAuthor = xss(author);
        const sanitizedContent = xss(content);

        // console.log(`sanitized content: ${sanitizedContent}, santized author: ${sanitizedAuthor}`)


        console.log(`event_id: ${event_id}, author: ${sanitizedAuthor}, content: ${sanitizedContent}`)


        let newComment  = new Comment(
            { event_id, author: sanitizedAuthor, content: sanitizedContent });

        try {
            await newComment.validate();
        }
        catch (error) {
            res.status(400).json({ message: 'Invalid comment' });
            return;
        }

        await newComment.save();

        // send update message to Event service through RabbitMQ
        let message : RabbitMQMessage = {
            action: COMMENT_CREATED_ACTION,
            data: {
                event_id: event_id
            }
        }
        await sendMessage(JSON.stringify(message), 'Comment Service')
        console.log(message.action)
        console.log(message.data)

        res.status(201).json({ message: 'Comment created successfully', comment: newComment });
    } catch (error) {
        res.status(500).json({ message: 'Server Error - :(' });
    }
};//createOrder

// retrieve specific comment
export const getCommentById = async (req: Request, res: Response): Promise<void>=> {
    try {
        const commentId: string = req.params.commentId;
        const comment = await Comment.findById( commentId );

        if (!comment) {
            res.status(404).json({ message: "No comment found"});
            return;
        }
        res.status(200).json({ comment });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// retrieve all comments for a specific event
export const getCommentsByEventId = async (req: Request, res: Response): Promise<void> => {
    try {
        const skip = parseInt(req.query.skip as string || '0', 10);
        const limit = parseInt(req.query.limit as string || '20', 10);
        console.log(`skip: ${skip}, limit: ${limit}`)

        const eventComments: CommentModel[] = await Comment.find( {event_id: req.params.eventId} )
            .skip(skip)
            .limit(limit)
            .exec();

        res.status(200).json(eventComments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server Error` });
    }
}