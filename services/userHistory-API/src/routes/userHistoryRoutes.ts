import express from 'express';
import {getHistoryByUserId } from "../controllers/userHistoryController";

const router = express.Router();


router.get('/user-history/:userId', getHistoryByUserId);

// router.get('/user-histories/closest-event/:userId', getUserClosestEvent);



export default router;