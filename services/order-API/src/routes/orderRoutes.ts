import express from 'express';
import {createOrder, getOrderById, getOrdersByEvent, getOrdersByUserId, handlePayment} from "../controllers/orderController";



const router = express.Router();


router.post('/orders', createOrder);

router.post('/orders/pay', handlePayment)

router.get('/orders/:orderId', getOrderById);
router.get('/orders/user/:userId', getOrdersByUserId);
router.get('/orders/event/:eventId', getOrdersByEvent);



export default router;