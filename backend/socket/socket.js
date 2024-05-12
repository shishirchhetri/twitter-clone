import {Server} from 'socket.io'
import http from 'http'
import express from 'express';
import Message from '../models/message.model.js'
import Conversation from '../models/conversation.model.js';

const app = express();
const server = http.createServer(app);
// creating server and binding with http
const io = new Server(server, {
    cors:{
        origin: 'http://localhost:3000',
        methods:['GET', 'POST']
    }
});

export const getRecipientSocketId = (recipientId)=>{
    return userSocketMap[recipientId];
}

//userId is passed as a socketId
const userSocketMap = {}

io.on('connection', (socket)=>{
    console.log('User connected: ', socket.id);

    //the userId is passed by the frontend context provider
    const userId =socket.handshake.query.userId

    //updating user online status
    if(userId !== 'undefined'){
        userSocketMap[userId]=socket.id; 
    }
    //Object.keys converts the keys inside an object to array i.e. array of each userID eg: [1232,3232]
    io.emit('getOnlineUsers', Object.keys(userSocketMap)) 

    socket.on('markMessagesAsSeen', async({conversationId, userId}) =>{
        try{
            await Message.updateMany({conversationId:conversationId, seen: false}, {$set :{seen: true}})
            await Conversation.updateOne({_id:conversationId}, {$set: {'lastMessage.seen' : true}})
            io.to(userSocketMap[userId]).emit('messagesSeen', conversationId)
        }catch(error){
            console.log(error);
        }
    })

    socket.on('disconnect', ()=>{
        console.log('User disconnected ')
        //delete the useId from userSocketMap after being offline and update object key
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap)) 

    })
})



export {io, server, app};