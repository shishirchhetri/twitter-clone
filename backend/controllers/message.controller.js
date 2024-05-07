import express from "express";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

//send message controller
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user._id;

    //find the previous conversation between sender and receiver if it exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    //create a new conversation if we don't have previous conversation
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

    //create new message if we do not have conversation before
    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
    });

    //to run two async functions simultaneously
    await Promise.all([
      //save the message in db
      newMessage.save(),
      //update the last message sent
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);

    res.status(201).json(newMessage);
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
      res.status(404).json({ error: "conversation not found!" });
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

//get conversations
export const getConversations = async (req, res) => {
  const userId = req.user._id;
  try {
    //finding all the conversations the currently loggedin user is involved
    //and also find the username and profileImg of the other users with whom
    // he is involved in conversations
    const conversations = await Conversation.find({
      participants: { $in: userId },
    });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
