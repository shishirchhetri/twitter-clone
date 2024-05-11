import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([])
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  useEffect(() => {
    const socket = io("http://localhost:4000", {
      query: {
        userId: authUser?._id,
      },
    });
    setSocket(socket);

    socket.on('getOnlineUsers',(users)=>{
      setOnlineUsers(users)
    } )
    return () => socket && socket.close();
  }, [authUser?._id]);
  console.log(onlineUsers)

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
