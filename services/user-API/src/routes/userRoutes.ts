import express from 'express';
import {
    createUser,
    getUserById,
    getUserByUsername,
    updateUserPassword,
    updateUserPermission,
    updateRatingCounter
} from "../controllers/userContoller.js";

const router = express.Router();

router.post('/users', createUser);

router.get('/users/:userId', getUserById);
router.get('/users/username/:username', getUserByUsername);

router.put('/users/username/:username', updateUserPassword)
router.put('/users/permission/:username', updateUserPermission)
router.put('/users/rating/:username', updateRatingCounter)


export default router;