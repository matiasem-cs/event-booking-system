import express from 'express';
import {createComment, getCommentById, getCommentsByEventId} from "../controllers/commentController";

const router = express.Router();


router.post('/comments', createComment);

router.get('/comments/:commentId', getCommentById);
router.get('/comments/event/:eventId', getCommentsByEventId);


export default router;