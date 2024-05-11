import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import postRoute from './routes/post.route.js';
import notificationRoute from './routes/notification.route.js';
import messageRoute from './routes/message.route.js';

import connectMongo from './db/connectMongoDB.js';
import { app, server } from './socket/socket.js';

dotenv.config();
//cloudinary image update config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT;

//resolving the path errors
const __dirname = path.resolve();

//for parsing jwt cookie token
app.use(cookieParser());
//middleware to parse data from frontend
//providing 5mb by overwriting 100kb default (for image upload)
app.use(express.json({ limit: '5mb' }));
//parse form data (url encoded)
app.use(express.urlencoded({ extended: true }));

//routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/messages', messageRoute);

if (process.env.NODE_ENV === 'production') {
  //use dist folder as static path
  app.use(express.static(path.join(__dirname, '/frontend/dist')));

  //navigate the user to react-app if requests, other than the above listed
  //appears in production mode
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongo();
});
