import express from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';

import { getNotification, deleteNotifications, deleteSingleNotification} from '../controllers/notification.controller.js';


const router = express.Router();

//getting notification route
router.get('/',protectRoute, getNotification );

//deleting the logged in user's notification
router.delete('/',protectRoute, deleteNotifications );

//deleting single notification
router.delete('/:id', protectRoute, deleteSingleNotification)

export default router;