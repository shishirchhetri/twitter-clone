import Notification from "../models/notification.model.js";

export const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    //searching the notification which is to be send to the user and finding the username of the finder
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    //updating the read status of the notification
    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in gettting notification: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    //deleting the notification that is sent to the logged in user
    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully!" });
  } catch (error) {
    console.log("Error in deleting notification: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const deleteSingleNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const notificationId = req.params.id;

    //deleting the notification that is sent to the logged in user
    const notification = await Notification.findById(notificationId);
    
    if(!notification){
      return res.status(403).json({error: 'notification with that id not found!'});
    }

    if(notification.to.toString() !== userId.toString()){
      return res.status(401).json({error:'you are not authorized to delete the notification!'})
    }
    
    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "Notification deleted successfully!" });
  } catch (error) {
    console.log("Error in deleting notification: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};
