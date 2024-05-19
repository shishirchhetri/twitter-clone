# Twitter Clone App

This is a Twitter clone application built using React.js, Tanstack query, MongoDB, Node.js, Express, Socket.io and Tailwind CSS.

## Features

- **Authentication**: Users can sign up, log in, and log out. Authentication is implemented using JSON Web Tokens (JWT).
- **Data Management**: Utilizes React Query for data fetching, caching, and synchronization.
- **Suggested Users**: Provides suggestions for users to follow based on interests and connections.
- **Post Creation**: Users can create new posts.
- **Post Interaction**: Users can like posts, comment on posts, and delete their own posts.
- **Profile Management**: Users can edit their profile information, including cover image and profile image.
- **Image Uploads**: Supports image uploads using Cloudinary.
- **Notifications**: Users receive notifications for various activities, such as new followers and post interactions.
- **Messaging**: Supports direct messaging between users using socket.io.
- **Conversation Management**: Users can delete conversations.
- **Message Status**: Shows message status (seen/unseen).
- **Image Sending**: Allows users to send images in messages using Cloudinary.

## Tech Stack

- **Frontend**: React.js, Tanstack query
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Styling**: Tailwind CSS

## Installation

1. Clone the repository:

```bash
git clone git@github.com:shishirchhetri/twitter-clone.git
```

2. Install dependencies:

```bash
cd twitter-clone
npm install
```

3. Set up environment variables:

```bash
# Create a .env file in the root directory
touch .env
```

Add the following environment variables to the `.env` file:

```plaintext
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN = '15d' // expiry date for jwt cookie
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace `your_mongodb_uri`, `your_jwt_secret`, `your_cloudinary_cloud_name`, `your_cloudinary_api_key`, and `your_cloudinary_api_secret` with your actual values.

4. Run the application:

```bash
npm start
```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## Contributing

Contributions are welcome! Feel free to open issues and pull requests to suggest new features, report bugs, or improve the existing codebase.

## License

This project is licensed under the [MIT License](LICENSE).
