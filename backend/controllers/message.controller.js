import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getRecipientSocketId,io } from "../socket/socket.js";
import { v2 as cloudinary } from 'cloudinary';


export const sendMessage = async (req, res) => {
  try {
    const { recipientId, message, img } = req.body; // Extract img parameter from req.body
    const senderId = req.user._id;

    // find the previous conversation between sender and receiver if it exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    // create a new conversation if we don't have a previous conversation
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
        },
      });

      await conversation.save();
    }

    let uploadedImgUrl = '';
    if (img) {
      // If img exists, upload the image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(img);
      uploadedImgUrl = uploadResponse.secure_url;
    }

    // create a new message
    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: uploadedImgUrl, // Use the uploaded image URL here
    });

    // save the message in the database and update the last message sent
    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);

    // sending the message to the recipient through socket
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('newMessage', newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("error while sending message: ", error);
    res.status(500).json({ error: error.message });
  }
};

//get the previous messages if exists
export const getMessages = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user._id;

  try {
    //find if there was conversation between the users or not
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "conversation not found!" });
    }

    //finding if there was messages between the users or not
    //if found sort by latest first so we can show latest at bottom
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("error while getting messages: ", error);
    res.status(500).json({ error: error.message });
  }
};

//get all the conversations the logged in user is involved in
export const getConversations = async (req, res) => {
  const userId = req.user._id;
  try {
    //finding all the conversations the currently loggedin user is involved
    //and also find the username and profileImg of the other users with whom
    // he is involved in conversations
    const conversations = await Conversation.find({
      participants: { $in: userId },
    }).populate({
      path: 'participants',
      select:'fullName username profileImg'
    }).sort({updatedAt: -1});

    // remove the current user from the participants array
		conversations.forEach((conversation) => {
			conversation.participants = conversation.participants.filter(
				(participant) => participant._id.toString() !== userId.toString()
			);
		});

    return res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete a conversation
export const deleteConversation = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversationExists = await Conversation.findById(conversationId)
    if(!conversationExists){
      console.log('error: conversation doesnot exist');
      return res.status(404).json({error: 'conversation doesnot exist'})
    }
    
    // Delete the conversation from the database
    await Conversation.findByIdAndDelete(conversationId);
   
    // Delete all messages related to the conversation
    await Message.deleteMany({ conversationId });

    res.status(200).json({ message: 'Conversation and related messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation and related messages' });
  }
};





