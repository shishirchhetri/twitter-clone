import express from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';
import {
  deleteConversation,
  getConversations,
  getMessages,
  sendMessage,
} from '../controllers/message.controller.js';

const router = express.Router();

//getting all the conversation of the user with others
router.get('/conversations', protectRoute, getConversations);

//send a new message to a user
router.post('/', protectRoute, sendMessage);

// getting all the old messages
router.get('/:otherUserId', protectRoute, getMessages);

//delete a conversation
router.delete('/delete/:conversationId', protectRoute, deleteConversation)


export default router;
